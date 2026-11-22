// frontend/lib/autoTranslate.ts
// Translates every piece of English text on the page into the chosen
// language: buttons, dropdown options, labels, toasts and the guided tour.
//
// How it works
// - Watches the page (MutationObserver) for text that appears or changes.
// - Sends new English strings in small batches to the same free Google
//   translation endpoint the SILAI studio already uses, and swaps the text in
//   place. React keeps working because only the text content changes, never
//   the elements themselves.
// - Every translation is cached on the device (localStorage), so a page seen
//   once in a language loads instantly next time, even on a slow connection.
// - Switching back to English restores the original text.
//
// What it leaves alone: anything the user types (inputs, text areas), code,
// SVG, the studio iframe, and any element marked translate="no".

const ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const CACHE_PREFIX = "roopvana.tr.";
const BATCH_CHARS = 1500;
const ATTRS = ["placeholder", "title", "aria-label"] as const;

type TextRec = { orig: string; shown: string };
type Cache = Record<string, string>;

let currentLang = "en";
let observer: MutationObserver | null = null;
const textRecs = new Map<Text, TextRec>();
const attrRecs = new Map<Element, Record<string, TextRec>>();
const pending = new Set<string>();
let flushTimer: number | null = null;
let cache: Cache = {};

function loadCache(lang: string): Cache {
  try { return JSON.parse(localStorage.getItem(CACHE_PREFIX + lang) || "{}"); } catch { return {}; }
}
let saveTimer: number | null = null;
function saveCache() {
  if (saveTimer) return;
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    try { localStorage.setItem(CACHE_PREFIX + currentLang, JSON.stringify(cache)); } catch { /* storage full */ }
  }, 800);
}

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "CODE", "PRE", "IFRAME", "svg", "SVG"]);

function skipElement(el: Element | null): boolean {
  for (let e = el; e; e = e.parentElement) {
    if (SKIP_TAGS.has(e.tagName)) return true;
    if (e.getAttribute("translate") === "no" || e.hasAttribute("data-no-translate")) return true;
  }
  return false;
}

/** Only English-looking text is translated: at least one 2-letter Latin word. */
function needsTranslation(s: string): boolean {
  const t = s.trim();
  if (t.length < 2 || !/[A-Za-z]{2,}/.test(t) || t === "RoopVana" || t === "SILAI") return false;
  // leave emails, web addresses, ids and initials (e.g. an avatar "TD") alone
  if (/^\S+@\S+\.\S+$/.test(t) || /^(https?:\/\/|www\.)\S+$/i.test(t)) return false;
  if (/^[A-Z]{1,3}$/.test(t) || /^[A-Za-z0-9_-]{16,}$/.test(t)) return false;
  return true;
}

function splitWs(s: string) {
  const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
  return { lead: m[1], core: m[2], trail: m[3] };
}

function apply(core: string): string | undefined {
  return cache[core];
}

// ── text nodes ───────────────────────────────────────────────────────────
function handleText(node: Text) {
  if (currentLang === "en") return;
  const value = node.nodeValue || "";
  const rec = textRecs.get(node);
  if (rec && value === rec.shown) return;            // our own write
  if (!needsTranslation(value) || skipElement(node.parentElement)) return;
  const r: TextRec = { orig: value, shown: value };
  textRecs.set(node, r);
  const { lead, core, trail } = splitWs(value);
  const done = apply(core);
  if (done !== undefined) {
    r.shown = lead + done + trail;
    node.nodeValue = r.shown;
  } else {
    queue(core);
  }
}

// ── attributes (placeholder, title, aria-label) ─────────────────────────
function handleAttrs(el: Element) {
  if (currentLang === "en" || skipElement(el.parentElement) || el.getAttribute("translate") === "no") return;
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (!v) continue;
    const recs = attrRecs.get(el) || {};
    const rec = recs[a];
    if (rec && v === rec.shown) continue;
    if (!needsTranslation(v)) continue;
    const r: TextRec = { orig: v, shown: v };
    recs[a] = r; attrRecs.set(el, recs);
    const done = apply(v.trim());
    if (done !== undefined) { r.shown = done; el.setAttribute(a, done); }
    else queue(v.trim());
  }
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) { handleText(root as Text); return; }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (skipElement(el)) return;
  handleAttrs(el);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n: Node | null = tw.nextNode();
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) handleText(n as Text);
    else handleAttrs(n as Element);
    n = tw.nextNode();
  }
}

// ── batching and fetching ────────────────────────────────────────────────
function queue(core: string) {
  pending.add(core);
  if (flushTimer === null) flushTimer = window.setTimeout(flush, 120);
}

async function fetchOne(text: string, lang: string): Promise<string> {
  const url = `${ENDPOINT}?client=gtx&sl=en&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate ${res.status}`);
  const data = await res.json();
  return ((data[0] || []) as [string][]).map((c) => c[0]).join("");
}

/** Several strings in one request, one per line; falls back to one by one. */
async function fetchBatch(texts: string[], lang: string): Promise<string[]> {
  if (texts.length === 1) return [await fetchOne(texts[0], lang)];
  try {
    const out = (await fetchOne(texts.join("\n"), lang)).split("\n").map((s) => s.trim());
    if (out.length === texts.length) return out;
  } catch { /* fall through */ }
  const out: string[] = [];
  for (const t of texts) out.push(await fetchOne(t, lang).catch(() => t));
  return out;
}

async function flush() {
  flushTimer = null;
  const lang = currentLang;
  const items = [...pending].filter((t) => cache[t] === undefined && !t.includes("\n"));
  const multiline = [...pending].filter((t) => cache[t] === undefined && t.includes("\n"));
  pending.clear();
  if (lang === "en") return;

  const batches: string[][] = [];
  let cur: string[] = [], len = 0;
  for (const t of items) {
    if (len + t.length > BATCH_CHARS && cur.length) { batches.push(cur); cur = []; len = 0; }
    cur.push(t); len += t.length + 1;
  }
  if (cur.length) batches.push(cur);
  multiline.forEach((t) => batches.push([t]));

  for (const b of batches) {
    try {
      const out = await fetchBatch(b, lang);
      if (lang !== currentLang) return;           // language changed meanwhile
      b.forEach((t, i) => { if (out[i]) cache[t] = out[i]; });
      saveCache();
      refreshAll();
    } catch (e) {
      console.warn("[RoopVana translate] failed; text stays in English:", e);
    }
  }
}

/** Re-apply cached translations to everything we are tracking. */
function refreshAll() {
  textRecs.forEach((r, node) => {
    if (!node.isConnected) { textRecs.delete(node); return; }
    if (node.nodeValue !== r.shown) return;        // React changed it; observer will pick it up
    const { lead, core, trail } = splitWs(r.orig);
    const done = cache[core];
    if (done !== undefined && r.shown !== lead + done + trail) {
      r.shown = lead + done + trail;
      node.nodeValue = r.shown;
    }
  });
  attrRecs.forEach((recs, el) => {
    if (!el.isConnected) { attrRecs.delete(el); return; }
    for (const a of Object.keys(recs)) {
      const r = recs[a];
      if (el.getAttribute(a) !== r.shown) continue;
      const done = cache[r.orig.trim()];
      if (done !== undefined && r.shown !== done) { r.shown = done; el.setAttribute(a, done); }
    }
  });
}

function restoreAll() {
  textRecs.forEach((r, node) => { if (node.isConnected && node.nodeValue === r.shown) node.nodeValue = r.orig; });
  attrRecs.forEach((recs, el) => {
    if (!el.isConnected) return;
    for (const a of Object.keys(recs)) if (el.getAttribute(a) === recs[a].shown) el.setAttribute(a, recs[a].orig);
  });
  textRecs.clear(); attrRecs.clear();
}

/** Turn page translation on for `lang`, or off for "en". Safe to call repeatedly. */
export function setPageLanguage(lang: string) {
  if (lang === currentLang && (lang === "en" || observer)) return;
  observer?.disconnect(); observer = null;
  restoreAll();
  currentLang = lang;
  if (lang === "en") return;
  cache = loadCache(lang);
  observer = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === "characterData") handleText(m.target as Text);
      else if (m.type === "attributes") handleAttrs(m.target as Element);
      else m.addedNodes.forEach((n) => walk(n));
    }
  });
  observer.observe(document.body, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: [...ATTRS],
  });
  walk(document.body);
}
