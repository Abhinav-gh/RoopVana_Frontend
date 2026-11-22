/* SILAI Executable Craft Object
   id      : kurta_sleeveless
   kind    : garment
   deps    : kit, kurta-block
   source  : USHA Silai School tailoring manual (Zarapkar drafting system) - Kurti, sleeveless variant
   This file is served from the SILAI object store (eco/manifest.json). The studio
   fetches it, checks its SHA-256 against the manifest, then runs the factory below.
   The drafting code inside is unchanged from the single-file studio. */
SILAI.define('kurta_sleeveless', ["kit", "kurta-block"], function (kit, block) {
  const { fmt, V, dimH, dimV, crPath } = kit;
  const { SIZE_CHART, BASE_SIL, SLEEVELESS_SIL, BODY_STEPS, BODY, SLEEVELESS_BODY, SLEEVED_HL, SLEEVELESS_HL, INSTR_BODY, INSTR_SLEEVELESS } = block;
  const PARTS = {};   // this object's descriptor is written as PARTS.<id> below

    PARTS.kurta_sleeveless = {
      label:'Kurta Sleeveless', tag:'sleeveless kurti · armhole = finished edge', chart:'kurti',
      uses:['C','S','H','W','L','Wd'],
      phases:[SLEEVELESS_BODY],
      garmentTitle:'Finished kurti — sleeveless',
      garment:{ base:SLEEVELESS_SIL, hl:SLEEVELESS_HL, fold:{y1:33,y2:184}, HL:{
        1:{ids:['length'],cap:'Drafted on the fold — the centre line is the full length.'},
        2:{ids:['length','shoulder'],cap:'Length (A→B), width (H/4+1) and the shoulder point / tira (S/2).'},
        3:{ids:['chest'],cap:'Chest line — reference for armhole depth & side shaping. Not a stitched seam.'},
        4:{ids:['waist'],cap:'Waist line — the side seam nips in here (F→H).'},
        5:{ids:['hip','side'],cap:'Hip line + side seam: stitch F–H–J–C, right sides together.'},
        6:{ids:['neckline'],cap:'Neck box sets depth (C/6) and width (C/12).'},
        7:{ids:['neckline','backneck'],cap:'Both neck curves on the one half piece — front C/6 (solid), back A↓4″ (dashed).'},
        8:{ids:['shoulder'],cap:'Shoulder slope — front & back panels join along this seam.'},
        9:{ids:['armhole'],cap:'Sleeveless armhole — a finished edge, no sleeve. Bind the raw curve with bias directly.'},
      }},
    };

  const ECO = PARTS.kurta_sleeveless;
  ECO.id = 'kurta_sleeveless';
  ECO.chartSizes = SIZE_CHART;
  return ECO;
});
