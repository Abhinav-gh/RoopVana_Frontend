#!/usr/bin/env node
// Recompute the SHA-256 and size of every object in the SILAI object store.
// Run after editing or adding a file under public/eco/:
//   node scripts/update-eco-manifest.mjs           (rewrite public/eco/manifest.json)
//   node scripts/update-eco-manifest.mjs --check   (exit 1 if any hash is out of date)
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const store = join(root, 'public', 'eco');
const manifestPath = join(store, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const check = process.argv.includes('--check');
const ids = new Set(manifest.objects.map(o => o.id).concat(['kit']));
let stale = 0, missing = 0;

for (const o of manifest.objects) {
  const file = join(store, o.file);
  if (!existsSync(file)) { console.error(`missing file for ${o.id}: ${o.file}`); missing++; continue; }
  for (const d of o.deps) if (!ids.has(d)) { console.error(`${o.id}: unknown dependency '${d}'`); missing++; }
  const text = readFileSync(file);
  const sha256 = createHash('sha256').update(text).digest('hex');
  if (!text.toString('utf8').includes(`SILAI.define('${o.id}'`)) { console.error(`${o.file} does not define '${o.id}'`); missing++; }
  if (sha256 !== o.sha256 || text.length !== o.bytes) {
    stale++;
    console.log(`${check ? 'out of date' : 'updated'}: ${o.id} ${o.sha256?.slice(0, 12)} -> ${sha256.slice(0, 12)}`);
    o.sha256 = sha256; o.bytes = text.length;
  }
}
for (const g of manifest.garments) if (!manifest.objects.some(o => o.id === g && o.kind === 'garment')) {
  console.error(`garments list names '${g}', which is not a garment object`); missing++;
}
if (missing) process.exit(1);
if (check) process.exit(stale ? 1 : 0);
if (stale) writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(stale ? `manifest updated (${stale} object(s))` : 'manifest already up to date');
