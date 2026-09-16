// frontend/components/SewingPatternStudio.tsx
// SILAI parametric pattern studio, embedded in RoopVana as a full-screen overlay.
//
// The actual drafting engine (all four garments, live L·S·C measurements,
// corpus-exact neck/sleeve/armhole curves, multilingual instructions, the
// "component name" toggle, the two-panel draft+preview layout) lives in
// public/silai-dag-studio.html — a self-contained tool that's easiest to keep
// correct and iterate on as one file, so it's embedded here via iframe rather
// than re-implemented as React state. This component's only job is to open it
// on the right garment: there is no in-studio switcher anymore — the person
// already chose kurti / blouse / trousers on the main site, so the studio
// should land directly on that, the same way it's always worked for kurtas.

import React from "react";

export type SilaiGarment = "kurta_sleeve" | "kurta_sleeveless" | "blouse" | "trousers" | "shirt";
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
}

export default function SewingPatternStudio({ open, onClose, garment = "kurta_sleeve", size = "medium" }: SewingPatternStudioProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

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
          key={`${garment}:${size}`}
          title="SILAI pattern studio"
          src={`/silai-dag-studio.html?part=${encodeURIComponent(garment)}&size=${encodeURIComponent(size)}`}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      </div>
    </div>
  );
}