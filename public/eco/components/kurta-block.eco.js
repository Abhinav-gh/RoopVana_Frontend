/* SILAI Executable Craft Object
   id      : kurta-block
   kind    : component
   deps    : kit
   source  : USHA Silai School tailoring manual (Zarapkar drafting system) - Chapter 8 (measurement chart) and kurti chapter
   This file is served from the SILAI object store (eco/manifest.json). The studio
   fetches it, checks its SHA-256 against the manifest, then runs the factory below.
   The drafting code inside is unchanged from the single-file studio. */
SILAI.define('kurta-block', ["kit"], function (kit) {
  const { fmt, V, dimH, dimV, crPath } = kit;

  // Corpus measurement chart (Chapter 8). Wd (waist drop) is a drafting constant.
  const SIZE_CHART = {
    small:  {C:32, S:14,   H:34, W:26, L:36, SL:6,   Bm:11,   Wd:15},
    medium: {C:34, S:14.5, H:36, W:28, L:37, SL:6.5, Bm:11.5, Wd:15},
    large:  {C:36, S:15,   H:38, W:30, L:38, SL:7,   Bm:12,   Wd:15},
  };
  const BASE_SIL       = `M 61 19 C 57 21 52 22 47 23 C 39 28 33 35 30 44 C 36 50 43 53 49 54 C 50 80 51 94 51 108 C 51 126 47 140 45 150 C 44 165 41 176 40 186 Q 70 191 100 186 C 99 176 96 165 95 150 C 93 140 89 126 89 108 C 89 94 90 80 91 54 C 97 53 104 50 110 44 C 107 35 101 28 93 23 C 88 22 83 21 79 19 C 77 28 63 28 61 19 Z`;
  const SLEEVELESS_SIL = `M 61 19 C 57 21 51 22 47 22 C 52 34 52 46 49 54 C 50 80 51 94 51 108 C 51 126 47 140 45 150 C 44 165 41 176 40 186 Q 70 191 100 186 C 99 176 96 165 95 150 C 93 140 89 126 89 108 C 89 94 90 80 91 54 C 88 46 88 34 93 22 C 89 22 83 21 79 19 C 77 28 63 28 61 19 Z`;

  /* ═══ PHASE: KURTA BODY (9 steps) ═════════════════════════════════════ */
  const BODY_STEPS = [
    {n:1,en:'Fold the sheet',deps:[],formula:'sheet = L × (H/4+1)',man:false},
    {n:2,en:'Corners & shoulder pt',deps:['sheet'],formula:'B = L · C = H/4+1 · D = S/2',man:false},
    {n:3,en:'Chest line',deps:['A'],formula:'E = C/4−1 · F = C/4+1',man:false},
    {n:4,en:'Waist line',deps:['A'],formula:'G = A→G · H = W/4+1',man:false},
    {n:5,en:'Hip line + side seam',deps:['G','F','C'],formula:'I = G+7 · J = H/4+1',man:true},
    {n:6,en:'Neck box',deps:['A'],formula:'K = C/6 · M = C/12',man:false},
    {n:7,en:'Neck curves',deps:['M','K','A'],formula:'N = 4″ · french M→K, M→N',man:true},
    {n:8,en:'Shoulder slope',deps:['D','M'],formula:'P = C/36 − 0.2',man:false},
    {n:9,en:'Armhole',deps:['P','F'],formula:'french P→F · 0.5″ split',man:true},
  ];
  const BODY = {
    name:'Part 1 · Kurta body',
    scale:15, pad:34, mr:66, mb:16, foldDx:62,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G',Hh:'H',I:'I',J:'J',K:'K',M:'M',Lp:'L',N:'N',Pp:'P',Q:'Q'},
    labs:{A:'r',B:'r',C:'l',D:'u',E:'r',F:'l',G:'r',Hh:'l',I:'r',J:'l',K:'r',M:'u',Lp:'l',N:'r',Pp:'l',Q:'l'},
    small:{},
    sheet:(m)=>({W:m.H/4+1, H:m.L}),
    points:(m)=>{ const SW=m.H/4+1, SH=m.L, x=v=>SW-v; return {
      A:{x:SW,y:0,s:2,gov:'on fold',note:'fold top'}, B:{x:SW,y:SH,s:2,gov:'L',note:'fold hem'},
      C:{x:0,y:SH,s:2,gov:'H/4+1',note:'side hem'}, D:{x:x(m.S/2),y:0,s:2,gov:'S/2',note:'tira'},
      E:{x:SW,y:m.C/4-1,s:3,gov:'C/4−1',note:'chest·fold'}, F:{x:x(m.C/4+1),y:m.C/4-1,s:3,gov:'C/4+1',note:'chest·side'},
      G:{x:SW,y:m.Wd,s:4,gov:'A→G',note:'waist·fold'}, Hh:{x:x(m.W/4+1),y:m.Wd,s:4,gov:'W/4+1',note:'waist·side'},
      I:{x:SW,y:m.Wd+7,s:5,gov:'G+7',note:'hip·fold'}, J:{x:0,y:m.Wd+7,s:5,gov:'H/4+1',note:'HBL·side'},
      K:{x:SW,y:m.C/6,s:6,gov:'C/6',note:'neck depth'}, M:{x:x(m.C/12),y:0,s:6,gov:'C/12',note:'neck width'},
      Lp:{x:x(m.C/12),y:m.C/6,s:6,gov:'box',note:'neck corner'}, N:{x:SW,y:4,s:7,gov:'A↓4',note:'back neck'},
      Pp:{x:x(m.S/2),y:m.C/36-0.2,s:8,gov:'C/36−0.2',note:'shoulder tip'}, Q:{x:x(m.S/2),y:m.C/4-1,s:8,gov:'ref',note:'D→chest'},
    };},
    edges:(pt)=>{ const L=(a,b)=>`M ${a.x} ${a.y} L ${b.x} ${b.y}`;
      // neck French curves — vertical tangent at M, horizontal into K / N (corpus quarter-round)
      const wF = pt.K.x-pt.M.x, wB = pt.N.x-pt.M.x;
      const frontNeck = `M ${pt.M.x} ${pt.M.y} C ${pt.M.x} ${(pt.M.y+(pt.K.y-pt.M.y)*0.55).toFixed(2)} ${(pt.K.x-wF*0.45).toFixed(2)} ${pt.K.y} ${pt.K.x} ${pt.K.y}`;
      const backNeck  = `M ${pt.M.x} ${pt.M.y} C ${pt.M.x} ${(pt.M.y+(pt.N.y-pt.M.y)*0.5).toFixed(2)} ${(pt.N.x-wB*0.4).toFixed(2)} ${pt.N.y} ${pt.N.x} ${pt.N.y}`;
      // armhole (Step 9): concave French curve P→F, split by the D–Q vertical.
      // front (straight arm) sits RIGHT of D–Q, back (reverse arm) LEFT, 0.5″ apart.
      const aP=pt.Pp, aF=pt.F, ax=aF.x-aP.x, ay=aF.y-aP.y, al=Math.hypot(ax,ay)||1, aux=ax/al, auy=ay/al;
      let anx=auy, anry=-aux; if(anx<0){anx=-anx;anry=-anry;}
      const ach=(t)=>({x:aP.x+t*ax, y:aP.y+t*ay}), ac1=ach(0.30), ac2=ach(0.72);
      const afc1={x:ac1.x+1.0*anx,y:ac1.y+1.0*anry}, afc2={x:ac2.x+0.7*anx,y:ac2.y+0.7*anry};
      const abc1={x:afc1.x-0.5*anx,y:afc1.y-0.5*anry}, abc2={x:afc2.x-0.5*anx,y:afc2.y-0.5*anry};
      const frontArm=`M ${aP.x} ${aP.y} C ${afc1.x.toFixed(2)} ${afc1.y.toFixed(2)} ${afc2.x.toFixed(2)} ${afc2.y.toFixed(2)} ${aF.x} ${aF.y}`;
      const backArm =`M ${aP.x} ${aP.y} C ${abc1.x.toFixed(2)} ${abc1.y.toFixed(2)} ${abc2.x.toFixed(2)} ${abc2.y.toFixed(2)} ${aF.x} ${aF.y}`;
      return [
      {id:'fold_edge',s:2,color:'var(--purple)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'on fold'},
      {id:'hem_edge',s:2,color:'var(--green)',from:'C',to:'B',d:L(pt.C,pt.B),gov:'H/4+1'},
      {id:'chest_line',s:3,color:'var(--accent)',from:'F',to:'E',d:L(pt.F,pt.E),gov:'C/4+1'},
      {id:'waist_line',s:4,color:'var(--accent)',from:'Hh',to:'G',d:L(pt.Hh,pt.G),gov:'W/4+1'},
      {id:'hbl_line',s:5,color:'var(--accent)',from:'J',to:'I',d:L(pt.J,pt.I),gov:'H/4+1'},
      {id:'side_seam',s:5,color:'var(--red)',from:'F',to:'C',man:true,
        d:`M ${pt.F.x} ${pt.F.y} L ${pt.Hh.x} ${pt.Hh.y} C ${pt.Hh.x-1.2} ${pt.Hh.y+3} ${pt.J.x+0.2} ${pt.J.y-3.2} ${pt.J.x} ${pt.J.y} L ${pt.C.x} ${pt.C.y}`,gov:'F–H join · H–J hip · J–C'},
      {id:'neck_width',s:6,color:'var(--text3)',from:'M',to:'A',d:L(pt.M,pt.A),gov:'C/12'},
      {id:'neck_box_left',s:6,color:'var(--text3)',from:'M',to:'Lp',dash:true,d:L(pt.M,pt.Lp),gov:'box · M→L'},
      {id:'neck_box_bottom',s:6,color:'var(--text3)',from:'Lp',to:'K',dash:true,d:L(pt.Lp,pt.K),gov:'box · L→K'},
      {id:'front_neck',s:7,color:'var(--red)',from:'M',to:'K',man:true,d:frontNeck,gov:'french · front M→K'},
      {id:'back_neck',s:7,color:'var(--blue)',from:'M',to:'N',man:true,d:backNeck,gov:'french · back M→N'},
      {id:'dq_reference',s:8,color:'var(--text3)',from:'D',to:'Q',dash:true,d:L(pt.D,pt.Q),gov:'armhole split ref'},
      {id:'shoulder_seam',s:8,color:'var(--accent)',from:'M',to:'Pp',d:L(pt.M,pt.Pp),gov:'M→P · slope C/36−0.2'},
      {id:'front_armhole',s:9,color:'var(--red)',from:'Pp',to:'F',man:true,
        d:frontArm,gov:'straight · right of D–Q'},
      {id:'back_armhole',s:9,color:'var(--blue)',from:'Pp',to:'F',man:true,
        d:backArm,gov:'reverse · left of D–Q · 0.5″'},
    ];},
    steps:BODY_STEPS,
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g=''; const foldX=sx(SW);
      if(cur>=2){ g+=dimH(sx(pt.D.x),sx(pt.A.x),sy(0)-16,`S/2 = ${fmt(m.S/2)}″`);
                  g+=dimH(sx(pt.C.x),sx(pt.B.x),sy(SH)+18,`H/4+1 = ${fmt(m.H/4+1)}″`); }
      if(cur===2) g+=dimV(foldX+30,sy(0),sy(SH),`L = ${fmt(m.L)}″`);
      if(cur===3){ g+=dimV(foldX+16,sy(0),sy(pt.E.y),`C/4−1 = ${fmt(m.C/4-1)}″`);
                   g+=dimH(sx(pt.F.x),sx(pt.E.x),sy(pt.E.y)-9,`C/4+1 = ${fmt(m.C/4+1)}″`); }
      if(cur===4){ g+=dimV(foldX+16,sy(0),sy(pt.G.y),`A→G = ${fmt(m.Wd)}″`);
                   g+=dimH(sx(pt.Hh.x),sx(pt.G.x),sy(pt.G.y)-9,`W/4+1 = ${fmt(m.W/4+1)}″`); }
      if(cur===5){ g+=dimV(foldX+16,sy(pt.G.y),sy(pt.I.y),`G→I = 7″`);
                   g+=dimH(sx(pt.J.x),sx(pt.I.x),sy(pt.I.y)+13,`H/4+1 = ${fmt(m.H/4+1)}″`); }
      if(cur===6){ g+=dimV(foldX+16,sy(0),sy(pt.K.y),`C/6 = ${fmt(m.C/6)}″`);
                   g+=dimH(sx(pt.M.x),sx(pt.A.x),sy(0)-26,`C/12 = ${fmt(m.C/12)}″`); }
      if(cur===7) g+=dimV(foldX+16,sy(0),sy(pt.N.y),`A→N = 4″`);
      if(cur===8) g+=`<text class="dimtxt" x="${sx(pt.D.x)-9}" y="${sy(pt.Pp.y)+16}" text-anchor="end" fill="var(--accent2)">= ${fmt(m.C/36-0.2)}″</text>`;
      if(cur===9) g+=`<text class="dimtxt" x="${sx(pt.F.x)+16}" y="${sy(pt.F.y)-26}" fill="var(--purple)">0.5″ split (front vs back)</text>`;
      return g; },
  };


  const SLEEVELESS_BODY = Object.assign({}, BODY, {
    name:'Kurta body · sleeveless',
    steps: BODY_STEPS.map(s => s.n===9 ? {...s, en:'Armhole (finished edge)'} : {...s}),
  });

  /* ═══ GARMENT HIGHLIGHTS ══════════════════════════════════════════════ */
  const SLEEVED_HL = {
    length:`M 70 33 L 70 184`, shoulder:`M 61 19 C 57 21 52 22 47 23 M 79 19 C 83 21 88 22 93 23`,
    chest:`M 50 65 L 90 65`, waist:`M 51 108 L 89 108`, hip:`M 45 150 L 95 150`,
    neckline:`M 61 19 C 63 28 77 28 79 19`, backneck:`M 61 19 C 63 24.5 77 24.5 79 19`,
    armhole:`M 48 25 C 54 34 54 46 49 54 M 92 25 C 86 34 86 46 91 54`,
    side:`M 49 54 C 50 80 51 94 51 108 C 51 126 47 140 45 150 C 44 165 41 176 40 186 M 91 54 C 90 80 89 94 89 108 C 89 126 93 140 95 150 C 96 165 99 176 100 186`,
    sleeve:`M 47 23 C 39 28 33 35 30 44 C 36 50 43 53 49 54 M 93 23 C 101 28 107 35 110 44 C 104 50 97 53 91 54`,
    hem:`M 30 44 C 36 50 43 53 49 54 M 110 44 C 104 50 97 53 91 54`,
    cap:`M 47 23 C 39 28 33 35 30 44 M 93 23 C 101 28 107 35 110 44`,
  };
  const SLEEVELESS_HL = {
    length:`M 70 33 L 70 184`, shoulder:`M 61 19 C 57 21 51 22 47 22 M 79 19 C 83 21 89 22 93 22`,
    chest:`M 50 65 L 90 65`, waist:`M 51 108 L 89 108`, hip:`M 45 150 L 95 150`,
    neckline:`M 61 19 C 63 28 77 28 79 19`, backneck:`M 61 19 C 63 24.5 77 24.5 79 19`,
    armhole:`M 47 22 C 52 34 52 46 49 54 M 93 22 C 88 34 88 46 91 54`,
    side:`M 49 54 C 50 80 51 94 51 108 C 51 126 47 140 45 150 C 44 165 41 176 40 186 M 91 54 C 90 80 89 94 89 108 C 89 126 93 140 95 150 C 96 165 99 176 100 186`,
  };

  /* ═══ INSTRUCTIONS (functions of the live values) ═════════════════════ */
  const INSTR_BODY = {
    1:{draft:(v)=>[
        `Take a sheet of pattern paper at least ${fmt(v.L)}″ long and ${fmt(v.width*2)}″ wide — the full front width of the kurti with a little working margin.`,
        `Fold it in half lengthwise so it becomes ${fmt(v.L)}″ × ${fmt(v.width)}″. The folded edge is now the centre-front line, and every measurement is taken from this fold outward.`,
        "Keep the paper flat and square — a set-square along the fold keeps the top edge at a true right angle, because errors here get doubled when the piece opens out."],
       sew:()=>"You draft on the folded half only. When you cut fabric, place this fold on the fabric's own fold, so the front opens out perfectly symmetric.",
       tip:()=>"Use a sharp pencil and the longest ruler you have; a smooth, accurate fold line is the backbone of the whole pattern."},
    2:{draft:(v)=>[
        "Mark point A at the very top, sitting on the fold — the centre-front neck corner and the origin for everything that follows.",
        `From A, measure straight down the fold ${fmt(v.L)}″ (the full Length L) and mark B at the hem.`,
        `From B, measure ${fmt(v.width)}″ (H/4+1) horizontally toward the open side and mark C, the outer hem corner.`,
        `From A, measure ${fmt(v.tira)}″ (S/2) along the top toward the open edge and mark D, the shoulder point (tira).`],
       sew:null,
       tip:(v)=>`The ${fmt(v.width)}″ is Hip ÷ 4 + 1″ of ease — the extra inch lets the kurti skim rather than cling.`},
    3:{draft:(v)=>[
        `From A, measure ${fmt(v.chestStart)}″ (C/4−1) straight down the fold and mark E. This decides how deep the armhole will sit.`,
        `From E, rule a horizontal line ${fmt(v.chestWidth)}″ (C/4+1) toward the open edge and mark F.`,
        "The line E–F is the chest (bust) line — keep it dead parallel to the top edge, because the armhole and side seam are built off it."],
       sew:()=>"A construction guide, not a seam. It locates the underarm point (F) and fixes the armhole depth; nothing is stitched along it.",
       tip:()=>"For a fuller bust, drop E a little lower — a slightly deeper armhole is far more comfortable than a tight one."},
    4:{draft:(v)=>[
        `From A, measure ${fmt(v.Wd)}″ straight down the fold and mark G — the natural waist level (shoulder-to-waist length).`,
        `From G, measure ${fmt(v.waist)}″ (W/4+1) toward the open edge and mark H.`,
        "Join G–H — the waist line. H sits closer to the fold than the chest point F; that inward step is what nips the kurti in at the waist."],
       sew:null,
       tip:(v)=>`Waist width ${fmt(v.waist)}″ = Waist ÷ 4 + 1″. Bump the +1 to +1.5 or +2 for a looser, straighter silhouette.`},
    5:{draft:(v)=>[
        `From G, measure ${fmt(v.hipDrop)}″ straight down the fold and mark I, the hip level.`,
        `From I, measure ${fmt(v.width)}″ (H/4+1) toward the open edge and mark J. The line I–J is the hip line (HBL).`,
        "Shape the side seam in three parts: F→H is a gentle straight join, H→J is a soft outward hip curve, and J→C drops straight to the hem."],
       sew:()=>"Stitch the side seam right sides together, underarm F down to hem C, 1 cm allowance. Sew the hip curve slowly so it stays smooth, then press toward the back.",
       tip:()=>"Snip a few millimetres into the seam allowance at the deepest point of the hip curve so it lies flat when turned out."},
    6:{draft:(v)=>[
        `From A, measure ${fmt(v.neckDepth)}″ (C/6) straight down the fold and mark K — the front neck depth.`,
        `From A, measure ${fmt(v.neckWidth)}″ (C/12) toward the open edge and mark M — the neck width.`,
        "Square down from M and across from K to close the rectangle M–A–K–L. The neckline curve lives inside this box."],
       sew:null,
       tip:()=>"Depth (K) is the easy thing to change for taste — but keep the width (M) sensible so the shoulder still covers a bra strap."},
    7:{draft:(v)=>[
        "With a French curve, draw a smooth concave line from the shoulder-neck point M down to the centre-front depth K — the front neckline. It leaves M vertically and meets K flat.",
        `For the back neck, measure ${fmt(v.backNeck)}″ down from A and mark N — the back sits higher and shallower than the front.`,
        "Draw a second, gentler French-curve line from M to N — the back neckline."],
       sew:()=>"Finish the neck edge with a 1 cm bias binding or a shaped facing. Stay-stitch just inside the cut edge first so the curve can't stretch.",
       tip:()=>"Front and back necklines both start at M, so they meet cleanly at the shoulder seam when the pieces join."},
    8:{draft:(v)=>[
        `Real shoulders slope downward. From D, measure ${fmt(v.shoulderSlope)}″ (C/36−0.2) straight down and mark P.`,
        "Join M→P with a straight line — the finished shoulder seam, sloping gently from neck to shoulder tip."],
       sew:()=>"Join front and back at the shoulders along M–P, right sides together, 1 cm allowance; press open so it lies flat under the neckline binding.",
       tip:(v)=>`That small ${fmt(v.shoulderSlope)}″ drop stops the kurti standing up stiffly around the neck — subtle, but don't leave it out.`},
    9:{draft:()=>[
        "With a French curve, draw the armhole from the shoulder tip P down to the underarm F.",
        "Draw it twice, 0.5″ apart: the tighter inner curve is the front (straight-arm) armhole, the fuller curve is the back (reverse-arm). The D–Q line marks the split.",
        "The back armhole is a touch deeper so the arm can swing forward comfortably."],
       sew:()=>"This curve is where the sleeve sets in — go to Part 2 and draft a sleeve whose cap length matches this armhole exactly.",
       tip:()=>"Cut a small notch at the underarm and shoulder tip now; they become the marks that make setting the sleeve in painless."},
  };
  const INSTR_SLEEVELESS = Object.assign({}, INSTR_BODY, {
    9:{draft:()=>[
        "With a French curve, draw the shoulder-to-underarm armhole curve P→F — the shape is identical to the sleeved version.",
        "Because no sleeve is set in, this curve is a finished edge of the garment, so draw it clean and smooth.",
        "A single tidy line is enough — you don't need the front/back 0.5″ split, since the edge is simply bound."],
       sew:()=>"Bind the raw armhole: cut a 1″-wide bias strip, fold and press it over the edge, and stitch it down — applied directly, no sleeve. Stay-stitch first so the curve can't stretch.",
       tip:()=>"Cut the binding on the true bias (45° to the grain) so it stretches smoothly around the curve without puckering."},
  });
  BODY.instr = INSTR_BODY;
  SLEEVELESS_BODY.instr = INSTR_SLEEVELESS;

  return { SIZE_CHART, BASE_SIL, SLEEVELESS_SIL, BODY_STEPS, BODY, SLEEVELESS_BODY, SLEEVED_HL, SLEEVELESS_HL, INSTR_BODY, INSTR_SLEEVELESS };
});
