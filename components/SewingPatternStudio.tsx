// frontend/components/SewingPatternStudio.tsx
// SILAI parametric pattern studio, embedded in RoopVana as a full-screen overlay.
//
// The actual drafting engine (all seven garments, live measurements,
// corpus-exact neck/sleeve/armhole curves, multilingual instructions, the
// "component name" toggle, the draft+preview layout and its phone layout)
// lives in public/silai-dag-studio.html — a self-contained tool that's
// easiest to keep correct and iterate on as one file, so it's embedded here
// via iframe rather than re-implemented as React state. This component's only
// job is to open it on the right garment: there is no in-studio switcher —
// the person already chose the garment on the main site, so the studio
// lands directly on it.
//
// Phones (< 768px): the studio fills the whole screen, with a slim top bar
// holding the close button, so the close button never covers the studio's own
// language picker in the top-right corner. Larger screens keep the floating
// card with the close button in the backdrop.

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export type SilaiGarment =
  | "kurta_sleeve"
  | "kurta_sleeveless"
  | "blouse"
  | "trousers"
  | "shirt"
  | "skirt"
  | "tshirt";
export type SilaiSize = "small" | "medium" | "large";

interface SewingPatternStudioProps {
  open: boolean;
  onClose: () => void;
  /** Which garment to open the studio on. Defaults to the sleeved kurti,
   *  matching the original kurta-only behaviour when nothing else is passed. */
  garment?: SilaiGarment;
  /** Which body-size preset to open with (matches the studio's own Small/
   *  Medium/Large presets). Defaults to "medium" when nothing else is passed. */
  size?: SilaiSize;
  /** Language the studio translates its instructions into and reads them
   *  aloud in ("hi", "ta", …). English when nothing else is passed. */
  lang?: string;
}

export default function SewingPatternStudio({ open, onClose, garment = "kurta_sleeve", size = "medium", lang = "en" }: SewingPatternStudioProps) {
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    // stop the RoopVana page underneath from scrolling while the studio is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const src = `/silai-dag-studio.html?part=${encodeURIComponent(garment)}&size=${encodeURIComponent(size)}&lang=${encodeURIComponent(lang)}`;

  if (isMobile) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          display: "flex", flexDirection: "column",
          background: "#0d0d0f",
          height: "100dvh",
        }}
      >
        <div style={{
          flexShrink: 0, height: 48, display: "flex", alignItems: "center",
          padding: "0 8px", gap: 8,
          borderBottom: "1px solid #26262f", background: "#151519",
        }}>
          <button
            onClick={onClose}
            aria-label="Close pattern studio"
            style={{
              height: 36, padding: "0 14px", borderRadius: 9,
              border: "1px solid #26262f", background: "#1b1b21",
              color: "#eeeef4", cursor: "pointer", fontSize: 14, fontWeight: 600,
            }}
          >← Back</button>
          <span style={{ color: "#9393a8", fontSize: 13, fontWeight: 600 }}>Sewing pattern</span>
        </div>
        <iframe
          key={`${garment}:${size}:${lang}`}
          title="SILAI pattern studio"
          src={src}
          style={{ flex: 1, width: "100%", border: "none", display: "block" }}
        />
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,.72)", backdropFilter: "blur(3px)",
        display: "flex", padding: 0,
      }}
    >
      {/* Close button lives in the backdrop, outside the card, so it never
          sits on top of the studio's own header controls (language picker,
          component-name toggle) near that same corner. */}
      <button
        onClick={onClose}
        aria-label="Close pattern studio"
        style={{
          position: "fixed", top: 14, right: 18, zIndex: 1010,
          width: 34, height: 34, borderRadius: 9,
          border: "1px solid #26262f", background: "#1b1b21",
          color: "#9393a8", cursor: "pointer", fontSize: 15,
        }}
      >✕</button>
      <div style={{
        margin: "auto", width: "96vw", height: "92vh",
        borderRadius: 14, overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,.6)",
        position: "relative", background: "#0d0d0f",
      }}>
        <iframe
          key={`${garment}:${size}:${lang}`}
          title="SILAI pattern studio"
          src={src}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      </div>
    </div>
  );
}
