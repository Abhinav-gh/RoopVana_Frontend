// frontend/components/LanguagePicker.tsx
// Full-screen language choice.
// - Right after the first login (no language saved on this device yet) it
//   opens by itself, before the guided tour, and must be answered.
// - The language button in the header opens it again to change the language;
//   then it can be closed without changing anything.
// It is never shown on the login page. Each language is written in its own
// script so a person can find theirs without reading English.

import React from "react";
import { Check, Globe2, X } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/AuthContext";
import { SKIP_AUTH } from "@/lib/firebase";
import { LANGUAGES, LangCode } from "@/lib/i18n";

export default function LanguagePicker() {
  const { lang, chosen, setLang, pickerOpen, closePicker } = useLanguage();
  const { user, loading } = useAuth();
  const signedIn = SKIP_AUTH || (!loading && !!user);

  const firstTime = signedIn && !chosen;
  const show = firstTime || (signedIn && pickerOpen);

  React.useEffect(() => {
    if (!show || firstTime) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePicker(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, firstTime, closePicker]);

  if (!show) return null;

  return (
    <div
      translate="no"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your language"
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/95 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={firstTime ? undefined : closePicker}
    >
      <div
        className="relative w-full max-w-2xl my-auto rounded-2xl border border-primary/30 bg-card shadow-2xl p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {!firstTime && (
          <button
            type="button"
            onClick={closePicker}
            aria-label="Close"
            className="absolute top-3 right-3 w-9 h-9 rounded-lg border border-border bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-3">
            <Globe2 className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Choose your language
          </h2>
          <p className="text-sm text-muted-foreground mt-1">RoopVana · SILAI</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
          {LANGUAGES.map((l) => {
            const current = chosen && l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code as LangCode)}
                aria-pressed={current}
                className={
                  "relative flex flex-col items-center justify-center gap-0.5 rounded-xl border px-2 sm:px-3 py-3 sm:py-3.5 min-h-[60px] sm:min-h-[64px] " +
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors " +
                  (current
                    ? "border-primary bg-primary/15"
                    : "border-border bg-muted/60 hover:border-primary hover:bg-primary/10")
                }
              >
                {current && <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-primary" />}
                <span className="text-base sm:text-lg font-semibold text-foreground leading-tight">{l.native}</span>
                {l.native !== l.english && (
                  <span className="text-[11px] text-muted-foreground">{l.english}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
