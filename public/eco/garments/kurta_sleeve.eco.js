/* SILAI Executable Craft Object
   id      : kurta_sleeve
   kind    : garment
   deps    : kit, kurta-block, set-in-sleeve
   source  : USHA Silai School tailoring manual (Zarapkar drafting system) - Kurti with set-in sleeve
   This file is served from the SILAI object store (eco/manifest.json). The studio
   fetches it, checks its SHA-256 against the manifest, then runs the factory below.
   The drafting code inside is unchanged from the single-file studio. */
SILAI.define('kurta_sleeve', ["kit", "kurta-block", "set-in-sleeve"], function (kit, block, sleeve) {
  const { fmt, V, dimH, dimV, crPath } = kit;
  const { SIZE_CHART, BASE_SIL, SLEEVELESS_SIL, BODY_STEPS, BODY, SLEEVELESS_BODY, SLEEVED_HL, SLEEVELESS_HL, INSTR_BODY, INSTR_SLEEVELESS } = block;
  const { makeSleeve, INSTR_SLEEVE } = sleeve;
  const PARTS = {};   // this object's descriptor is written as PARTS.<id> below

  const SLEEVE = makeSleeve('Part 2 · Sleeve', 0.2);
  SLEEVE.instr = INSTR_SLEEVE;

    PARTS.kurta_sleeve = {
      label:'Kurta Sleeve', tag:'kurta + sleeve · Part 1 (1–9) + Part 2 (1–4)', chart:'kurti',
      uses:['C','S','H','W','L','SL','Bm','Wd'],
      phases:[BODY, SLEEVE],
      garmentTitle:'Finished kurti — this step',
      garment:{ base:BASE_SIL, hl:SLEEVED_HL, fold:{y1:33,y2:184}, HL:{
        1:{ids:['length'],cap:'Drafted on the fold — the centre line is the full length.'},
        2:{ids:['length','shoulder'],cap:'Length (A→B), width (H/4+1) and the shoulder point / tira (S/2).'},
        3:{ids:['chest'],cap:'Chest line — reference for armhole depth & side shaping. Not a stitched seam.'},
        4:{ids:['waist'],cap:'Waist line — the side seam nips in here (F→H).'},
        5:{ids:['hip','side'],cap:'Hip line + side seam: stitch F–H–J–C, right sides together.'},
        6:{ids:['neckline'],cap:'Neck box sets depth (C/6) and width (C/12).'},
        7:{ids:['neckline','backneck'],cap:'Both neck curves on the one half piece — front C/6 (solid), back A↓4″ (dashed).'},
        8:{ids:['shoulder'],cap:'Shoulder slope — front & back panels join along this seam.'},
        9:{ids:['armhole'],cap:'Body armhole — the sleeve cap eases into this curve.'},
        10:{ids:['sleeve'],cap:'Part 2 · the sleeve piece — cut on the fold, mirrored to full width.'},
        11:{ids:['sleeve'],cap:'Sleeve length (A→C) and bicep width (C/4−0.5).'},
        12:{ids:['hem'],cap:'Sleeve hem / mori (B/2) and the underarm seam D→E.'},
        13:{ids:['armhole'],cap:'Armhole — the cap is eased into this seam, where the sleeve meets the body.'},
      }},
    };

  const ECO = PARTS.kurta_sleeve;
  ECO.id = 'kurta_sleeve';
  ECO.chartSizes = SIZE_CHART;
  return ECO;
});
