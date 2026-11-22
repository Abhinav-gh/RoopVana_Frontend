// frontend/hooks/use-language.tsx
// One language choice for the whole site. Right after the first login a
// full-screen picker asks for it (components/LanguagePicker.tsx). It then sets:
// - the homepage text (fixed translations where we have them),
// - automatic translation of everything else on the page, including the
//   guided tour (lib/autoTranslate.ts),
// - the default voice-input language,
// - the language the SILAI studio opens in (text and read-aloud).
// The choice is remembered on this device (localStorage), so every later
// visit opens straight in that language. The language button in the header
// (and on the hero) opens the picker again to change it.

import React from "react";
import { LangCode, STRINGS, StringKey, isLangCode } from "@/lib/i18n";
import { setPageLanguage } from "@/lib/autoTranslate";

const STORAGE_KEY = "roopvana.lang";

/**
 * TESTING MODE: while true, nothing is remembered between page loads, so every
 * reload shows the language screen and then the guided tour again. Normal use:
 * false — the language is asked once and remembered.
 */
export const ASK_LANGUAGE_EVERY_LOAD = false;

interface LanguageContextValue {
  lang: LangCode;
  /** false until the person has picked a language on this device */
  chosen: boolean;
  setLang: (l: LangCode) => void;
  /** the picker was opened from the header to change the language */
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  t: (key: StringKey) => string;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

function savedLang(): LangCode | null {
  if (ASK_LANGUAGE_EVERY_LOAD) return null;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLangCode(saved)) return saved;
  } catch { /* storage blocked */ }
  return null;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<LangCode>(() => savedLang() || "en");
  const [chosen, setChosen] = React.useState<boolean>(() => savedLang() !== null);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const setLang = React.useCallback((l: LangCode) => {
    setLangState(l);
    setChosen(true);
    setPickerOpen(false);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);
  const openPicker = React.useCallback(() => setPickerOpen(true), []);
  const closePicker = React.useCallback(() => setPickerOpen(false), []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
    setPageLanguage(lang);
  }, [lang]);

  const t = React.useCallback(
    (key: StringKey) => STRINGS[lang]?.[key] ?? STRINGS.en[key],
    [lang],
  );

  const value = React.useMemo(
    () => ({ lang, chosen, setLang, t, pickerOpen, openPicker, closePicker }),
    [lang, chosen, setLang, t, pickerOpen, openPicker, closePicker],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    // Used outside the provider (e.g. a test): behave as English.
    return { lang: "en", chosen: true, setLang: () => {}, t: (k) => STRINGS.en[k],
             pickerOpen: false, openPicker: () => {}, closePicker: () => {} };
  }
  return ctx;
}
