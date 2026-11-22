/* SILAI Executable Craft Object
   id      : shirt
   kind    : garment
   deps    : kit, geometry
   source  : USHA Silai School tailoring manual (Zarapkar drafting system) - Part B, men's shirt
   This file is served from the SILAI object store (eco/manifest.json). The studio
   fetches it, checks its SHA-256 against the manifest, then runs the factory below.
   The drafting code inside is unchanged from the single-file studio. */
SILAI.define('shirt', ["kit", "geometry"], function (kit, geo) {
  const { fmt, V, dimH, dimV, crPath } = kit;
  const { bezAt, maxLean, fmt2, KAPPA, f2, qCtrl, qCurve, vCurve, lin, skUnit, skArc, skAtLen } = geo;
  const PARTS = {};   // this object's descriptor is written as PARTS.<id> below

  // Men's shirt chart (USHA Silai School, Part B — nाप तालिका, Ch. "पुरुषों की शर्ट")
  const SHIRT_CHART = {
    small:  {L:30, S:18, C:36, SL:23.5, N:16, CF:2, CR:9},
    medium: {L:31, S:19, C:38, SL:24,   N:17, CF:2, CR:9.5},
    large:  {L:32, S:20, C:40, SL:24.5, N:18, CF:2, CR:10},
  };
  /* ═══════════════════════════════════════════════════════════════════
     MEN'S SHIRT (USHA Silai School, Part B — "पुरुषों की शर्ट की ड्राफ्टिंग")
     नाप तालिका → L, S, C, SL, N, CF, CR.  Eight parts, exactly as printed:
       1 front · 2 back · 3 yoke · 4 collar · 5 sleeve · 6 placket · 7 cuff · 8 pocket
     Every point below is a literal reading of the chapter's numbered steps
     (चरण) and the yellow "सूत्र" formula boxes; curves the manual calls a
     "french curve" are built as exact quarter-rounds (qCurve) or, for the
     sleeve cap's quarter-division method, the same Catmull-Rom construction
     (crPath) already used for the kurta/blouse sleeve.
     ═══════════════════════════════════════════════════════════════════ */

  /* ── Part 1 · Front (5 steps) ─────────────────────────────────────────
     Cut flat, NOT on the fold — the button placket makes left and right
     asymmetric, so this piece is cut twice, mirrored. */
  const SHIRT_FRONT_STEPS = [
    {n:1,en:'Sheet + button placket',deps:[],formula:'sheet L × (C/4+3.5) · fold 1.5″ + overlap 0.5″'},
    {n:2,en:'Tira & chest line',deps:['sheet'],formula:'G=S/2 · H=C/4 (chest pt) · I=C/4+1.5 (chest line)'},
    {n:3,en:'Front neckline',deps:['E'],formula:'depth & width = C/12−0.7',man:true},
    {n:4,en:'Shoulder slope',deps:['G'],formula:'M = G↓1″ · join J→M'},
    {n:5,en:'Armhole',deps:['M','I'],formula:'french M→I · 0.5″ split (front/back)',man:true},
  ];
  const SHIRT_FRONT = {
    name:'Part 1 · Front', fold:false, scale:13, pad:34, mr:74, mb:18, foldDx:60,
    letters:{A:'A',C:'C',E:'E',G:'G',Hh:'H',I:'I',J:'J',K:'K',Lp:'L',M:'M',N:'N'},
    labs:{A:'r',C:'r',E:'r',G:'u',Hh:'r',I:'l',J:'u',K:'l',Lp:'r',M:'ul',N:'d'},
    small:{A:1,C:1,K:1,N:1},
    sheet:(m)=>({W:m.C/4+3.5, H:m.L}),
    points:(m)=>{ const SW=m.C/4+3.5, neckD=m.C/12-0.7;
      const A={x:SW,y:0}, C={x:SW-1.5,y:0}, E={x:SW-2,y:0};
      const G={x:E.x-m.S/2,y:0}, Hh={x:E.x,y:m.C/4}, I={x:0,y:m.C/4};
      const J={x:E.x-neckD,y:0}, Lp={x:E.x,y:neckD}, K={x:J.x,y:neckD};
      const M={x:G.x,y:1}, N={x:G.x,y:m.C/4};
      return {
        A:{...A,s:1,gov:'origin',note:'top·right corner'},
        C:{...C,s:1,gov:'A←1.5″',note:'placket·fold'},
        E:{...E,s:1,gov:'C←0.5″',note:'placket·overlap'},
        G:{...G,s:2,gov:'S/2',note:'tira'},
        Hh:{...Hh,s:2,gov:'C/4',note:'chest·point'},
        I:{...I,s:2,gov:'C/4+1.5',note:'chest·outer'},
        J:{...J,s:3,gov:'C/12−0.7',note:'neck·width'},
        Lp:{...Lp,s:3,gov:'C/12−0.7',note:'neck·depth'},
        K:{...K,s:3,gov:'box',note:'neck·corner'},
        M:{...M,s:4,gov:'G↓1″',note:'shoulder·tip'},
        N:{...N,s:4,gov:'ref',note:'G→chest'},
      };},
    edges:(pt,m)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      const SH=m.L;
      const frontNeck = qCurve(pt.J,pt.Lp);
      const ax=pt.I.x-pt.M.x, ay=pt.I.y-pt.M.y, al=Math.hypot(ax,ay)||1, ux=ax/al, uy=ay/al;
      let nx=uy, ny=-ux; if(nx<0){nx=-nx;ny=-ny;}
      const ach=t=>({x:pt.M.x+t*ax,y:pt.M.y+t*ay}), c1=ach(.3), c2=ach(.72);
      const fc1={x:c1.x+0.9*nx,y:c1.y+0.9*ny}, fc2={x:c2.x+0.6*nx,y:c2.y+0.6*ny};
      const bc1={x:fc1.x-0.5*nx,y:fc1.y-0.5*ny}, bc2={x:fc2.x-0.5*nx,y:fc2.y-0.5*ny};
      const frontArm=`M ${f2(pt.M.x)} ${f2(pt.M.y)} C ${f2(fc1.x)} ${f2(fc1.y)} ${f2(fc2.x)} ${f2(fc2.y)} ${f2(pt.I.x)} ${f2(pt.I.y)}`;
      const backArm =`M ${f2(pt.M.x)} ${f2(pt.M.y)} C ${f2(bc1.x)} ${f2(bc1.y)} ${f2(bc2.x)} ${f2(bc2.y)} ${f2(pt.I.x)} ${f2(pt.I.y)}`;
      return [
        {id:'placket_fold',s:1,color:'var(--purple)',from:'A',to:'C',d:`M ${f2(pt.C.x)} 0 L ${f2(pt.C.x)} ${f2(SH)}`,gov:'1.5″ fold'},
        {id:'placket_overlap',s:1,color:'var(--purple)',from:'C',to:'E',dash:true,d:`M ${f2(pt.E.x)} 0 L ${f2(pt.E.x)} ${f2(SH)}`,gov:'0.5″ overlap'},
        {id:'chest_line',s:2,color:'var(--accent)',from:'I',to:'Hh',d:L(pt.I,pt.Hh),gov:'C/4+1.5'},
        {id:'open_edge',s:2,color:'var(--green)',from:'I',to:'I',dash:true,d:`M ${f2(pt.I.x)} ${f2(pt.I.y)} L 0 ${f2(SH)}`,gov:'open edge'},
        {id:'neck_width',s:3,color:'var(--text3)',from:'J',to:'E',d:L(pt.J,pt.E),gov:'C/12−0.7'},
        {id:'neck_box',s:3,color:'var(--text3)',from:'J',to:'K',dash:true,d:L(pt.J,pt.K),gov:'box'},
        {id:'neck_box2',s:3,color:'var(--text3)',from:'K',to:'Lp',dash:true,d:L(pt.K,pt.Lp),gov:'box'},
        {id:'front_neck',s:3,color:'var(--red)',from:'J',to:'Lp',man:true,d:frontNeck,gov:'french · J→L'},
        {id:'gn_ref',s:4,color:'var(--text3)',from:'G',to:'N',dash:true,d:L(pt.G,pt.N),gov:'G↓chest'},
        {id:'shoulder_seam',s:4,color:'var(--accent)',from:'J',to:'M',d:L(pt.J,pt.M),gov:'J→M · slope 1″'},
        {id:'front_armhole',s:5,color:'var(--red)',from:'M',to:'I',man:true,d:frontArm,gov:'front · right of split'},
        {id:'back_armhole',s:5,color:'var(--blue)',from:'M',to:'I',man:true,d:backArm,gov:'back · 0.5″ split'},
      ];},
    steps:SHIRT_FRONT_STEPS,
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      if(cur===1){ g+=dimH(sx(pt.C.x),sx(pt.A.x),sy(0)-16,`1.5″ fold`);
                   g+=dimH(sx(pt.E.x),sx(pt.C.x),sy(0)-30,`0.5″ overlap`); }
      if(cur===2){ g+=dimH(sx(pt.G.x),sx(pt.E.x),sy(0)-16,`S/2 = ${fmt(m.S/2)}″`);
                   g+=dimV(sx(pt.Hh.x)+16,sy(0),sy(pt.Hh.y),`C/4 = ${fmt(m.C/4)}″`);
                   g+=dimH(sx(pt.I.x),sx(pt.Hh.x),sy(pt.Hh.y)+16,`C/4+1.5 = ${fmt(m.C/4+1.5)}″`); }
      if(cur===3){ g+=dimV(sx(pt.Lp.x)+14,sy(0),sy(pt.Lp.y),`C/12−0.7 = ${fmt(m.C/12-0.7)}″`);
                   g+=dimH(sx(pt.J.x),sx(pt.E.x),sy(0)-30,`C/12−0.7 = ${fmt(m.C/12-0.7)}″`); }
      if(cur===4){ g+=dimV(sx(pt.G.x)-14,sy(0),sy(pt.M.y),`1″`); }
      if(cur===5){ g+=`<text class="dimtxt" x="${sx(SW*0.4)}" y="${sy(SH*0.18)}" fill="var(--accent2)" text-anchor="middle">0.5″ split</text>`; }
      return g; },
  };

  const INSTR_SHIRT_FRONT = {
    1:{draft:(v,m)=>[
        `Take a sheet of pattern paper ${fmt(m.L)}″ long and ${fmt(m.C/4+3.5)}″ wide (C/4 + 3.5) — this front is cut flat, NOT on the fold, because the button placket makes the two edges different.`,
        `Mark A at the top-right corner. From A measure 1.5″ to the left and mark C — this is the fold line of the button placket.`,
        `From C measure a further 0.5″ to the left and mark E — the placket overlap. Everything else on this piece is measured outward from E.`],
       sew:()=>"Cut two front pieces, mirrored (one for each side of the opening). The strip between A and C folds under to face the placket; the strip between C and E is the overlap that hides the buttonholes.",
       tip:()=>"Press the 1.5″ fold before you cut the neckline and armhole — it is much easier to get a crisp placket edge on a flat, unshaped piece."},
    2:{draft:(v,m)=>[
        `From E measure ${fmt(m.S/2)}″ (S/2) to the left along the top edge and mark G — the tira, i.e. the shoulder point.`,
        `From E measure ${fmt(m.C/4)}″ (C/4) straight down and mark H — the chest point.`,
        `From H measure ${fmt(m.C/4+1.5)}″ (C/4 + 1.5) to the left and mark I. H→I is the chest line, and I lands almost exactly on the open (left) edge of the sheet.`],
       sew:null,
       tip:(v,m)=>`The chest line width (${fmt(m.C/4+1.5)}″) is exactly what the sheet width leaves over once the 2″ placket allowance is taken off — so I always meets the open edge.`},
    3:{draft:(v,m)=>[
        `From E measure ${fmt(m.C/12-0.7)}″ (C/12 − 0.7) straight down and mark L — the front neck depth.`,
        `From E measure the same ${fmt(m.C/12-0.7)}″ to the left and mark J — the front neck width.`,
        `From L, measure the same amount to the left and mark K, completing a small box (J–K–L). Join K to L, then use a French curve to round J into L.`],
       sew:()=>"J–L is the finished front neckline seam — where the collar band will be set in.",
       tip:()=>"Keep the curve close to the straight box lines near J and swing out only near the middle — a neckline that's rounded too early gapes when worn."},
    4:{draft:(v,m)=>[
        `From G measure 1″ straight down and mark M — the shoulder tip.`,
        `Join J to M. J–M is the shoulder slope — a flat 1″ drop, simpler than the kurta's calculated slope but doing the same job.`],
       sew:()=>"J–M is stitched to the yoke's own shoulder line (Part 3) — the yoke sits on top of this front panel at the shoulder.",
       tip:()=>"Because this drop is a flat 1″ regardless of chest size, always double-check it against the yoke's own slope (also a flat 1″) before cutting — they must match exactly."},
    5:{draft:()=>[
        `With a French curve, draw a concave line from M down to I — the front armhole.`,
        `Draw a second curve from M to I, kept 0.5″ inside the first (toward the neck) — the back armhole, drafted on this same front sheet as a paired reference the way the kurta body does it.`],
       sew:()=>"Cut along the front (outer) curve for the front piece. The 0.5″ gap is what the back panel's own armhole (Part 2) needs to clear the front by, so the two curves ease together at the shoulder and side seam.",
       tip:()=>"A deeper armhole (move I down slightly) gives more reach; too deep and the underarm shows when the arm is raised."},
  };
  SHIRT_FRONT.instr = INSTR_SHIRT_FRONT;

  /* ── Part 2 · Back (4 steps) — drafted on the fold, 1″ shorter than front ── */
  const SHIRT_BACK_STEPS = [
    {n:1,en:'Fold the sheet',deps:[],formula:'sheet (C/4+1.5)×2 wide, (L−1) long → folded (C/4+1.5)'},
    {n:2,en:'Length & width',deps:['sheet'],formula:'A→B = L−1 · B→C = C/4+1.5'},
    {n:3,en:'Tira & chest line',deps:['A'],formula:'D = S/2 · E = C/4−1 · F = C/4+1.5'},
    {n:4,en:'Armhole',deps:['D','F'],formula:'french D→F',man:true},
  ];
  const SHIRT_BACK = {
    name:'Part 2 · Back', scale:14, pad:34, mr:66, mb:18, foldDx:56,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G'},
    labs:{A:'r',B:'r',C:'l',D:'u',E:'r',F:'l',G:'l'}, small:{G:1},
    sheet:(m)=>({W:m.C/4+1.5, H:m.L-1}),
    points:(m)=>{ const SW=m.C/4+1.5, SH=m.L-1;
      const A={x:SW,y:0}, B={x:SW,y:SH}, C={x:0,y:SH};
      const D={x:SW-m.S/2,y:0}, E={x:SW,y:m.C/4-1}, F={x:0,y:m.C/4-1};
      const G={x:D.x,y:E.y};
      return {
        A:{...A,s:2,gov:'on fold',note:'fold·top'}, B:{...B,s:2,gov:'L−1',note:'fold·hem'},
        C:{...C,s:2,gov:'C/4+1.5',note:'side·hem'},
        D:{...D,s:3,gov:'S/2',note:'tira'}, E:{...E,s:3,gov:'C/4−1',note:'chest·point'},
        F:{...F,s:3,gov:'C/4+1.5',note:'chest·outer'}, G:{...G,s:4,gov:'ref',note:'D→chest'},
      };},
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      return [
        {id:'fold_edge',s:2,color:'var(--purple)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'on fold'},
        {id:'hem_edge',s:2,color:'var(--green)',from:'C',to:'B',d:L(pt.C,pt.B),gov:'C/4+1.5'},
        {id:'chest_line',s:3,color:'var(--accent)',from:'F',to:'E',d:L(pt.F,pt.E),gov:'C/4+1.5'},
        {id:'dg_ref',s:4,color:'var(--text3)',from:'D',to:'G',dash:true,d:L(pt.D,pt.G),gov:'D→chest'},
        {id:'back_armhole',s:4,color:'var(--blue)',from:'D',to:'F',man:true,d:qCurve(pt.D,pt.F),gov:'french · D→F'},
      ];},
    steps:SHIRT_BACK_STEPS,
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      if(cur>=2) g+=dimH(sx(pt.C.x),sx(pt.B.x),sy(SH)+18,`C/4+1.5 = ${fmt(m.C/4+1.5)}″`);
      if(cur===2) g+=dimV(sx(SW)+30,sy(0),sy(SH),`L−1 = ${fmt(m.L-1)}″`);
      if(cur===3){ g+=dimH(sx(pt.D.x),sx(pt.A.x),sy(0)-16,`S/2 = ${fmt(m.S/2)}″`);
                   g+=dimV(sx(SW)+16,sy(0),sy(pt.E.y),`C/4−1 = ${fmt(m.C/4-1)}″`); }
      return g; },
  };
  const INSTR_SHIRT_BACK = {
    1:{draft:(v,m)=>[
        `Take a sheet ${fmt((m.C/4+1.5)*2)}″ wide and ${fmt(m.L-1)}″ long, and fold it in half lengthwise so it becomes ${fmt(m.L-1)}″ × ${fmt(m.C/4+1.5)}″.`,
        `The fold is 1″ shorter than the front's own length — the yoke (Part 3) adds that inch back in at the shoulder, so the two panels finish level.`],
       sew:()=>"Cut 1 on the fold — the back is a single symmetric piece, unlike the front.",
       tip:()=>"Don't forget the −1″: cutting the back at the full length L, by habit, is the single most common mistake copying the front measurements over."},
    2:{draft:(v,m)=>[
        `Mark A at the top on the fold. From A measure ${fmt(m.L-1)}″ (L − 1) straight down and mark B.`,
        `From B measure ${fmt(m.C/4+1.5)}″ (C/4 + 1.5) to the left and mark C — the outer hem corner.`],
       sew:null,
       tip:(v,m)=>`Back width and front chest-line width are both C/4+1.5 = ${fmt(m.C/4+1.5)}″ — the side seam meets edge to edge with no easing needed.`},
    3:{draft:(v,m)=>[
        `From A measure ${fmt(m.S/2)}″ (S/2) along the top edge and mark D — the back tira.`,
        `From A measure ${fmt(m.C/4-1)}″ (C/4 − 1) straight down and mark E — the back chest point.`,
        `From E measure ${fmt(m.C/4+1.5)}″ to the left and mark F. E–F is the back chest line.`],
       sew:()=>"Not a seam — a construction guide that fixes how deep the back armhole sits.",
       tip:(v,m)=>`The back chest point (C/4−1 = ${fmt(m.C/4-1)}″) sits 2″ higher than the front's (C/4 = ${fmt(m.C/4)}″) — the back armhole is shallower, which is normal: the back doesn't need the same reach room as the front.`},
    4:{draft:()=>[
        `From D drop a line straight down to the chest line and mark G (a construction reference only).`,
        `With a French curve, join D to F — this single curve is the whole back armhole.`],
       sew:()=>"D–F is stitched to the shoulder seam at D (from the yoke) and to the side seam at F, joining the front's own armhole at the underarm.",
       tip:()=>"Simpler than the front: the back needs only one curve, because there's no separate front/back split to draft here — that split already happened on the front sheet."},
  };
  SHIRT_BACK.instr = INSTR_SHIRT_BACK;

  /* ── Part 3 · Yoke (4 steps) — drafted on the fold ── */
  const SHIRT_YOKE_STEPS = [
    {n:1,en:'Fold the sheet',deps:[],formula:'sheet (S/2)×2 wide, (C/12+0.5) long → folded S/2'},
    {n:2,en:'Length & width',deps:['sheet'],formula:'A→B = C/12+0.5 · A→C = S/2'},
    {n:3,en:'Neckline',deps:['A'],formula:'E = C/12−0.7 · F = 0.5″',man:true},
    {n:4,en:'Shoulder slope',deps:['C'],formula:'G = C↓1″ · join E→G'},
  ];
  const SHIRT_YOKE = {
    name:'Part 3 · Yoke', scale:20, pad:36, mr:60, mb:24, foldDx:44,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G'},
    labs:{A:'r',B:'r',C:'l',D:'l',E:'u',F:'r',G:'l'}, small:{F:1,G:1},
    sheet:(m)=>({W:m.S/2, H:m.C/12+0.5}),
    points:(m)=>{ const SW=m.S/2, SH=m.C/12+0.5, neckW=m.C/12-0.7;
      const A={x:SW,y:0}, B={x:SW,y:SH}, C={x:0,y:0}, D={x:0,y:SH};
      const E={x:SW-neckW,y:0}, F={x:SW,y:0.5}, G={x:0,y:1};
      return {
        A:{...A,s:2,gov:'on fold',note:'fold·top'}, B:{...B,s:2,gov:'C/12+0.5',note:'fold·bottom'},
        C:{...C,s:2,gov:'S/2',note:'open·top'}, D:{...D,s:2,gov:'ref',note:'open·bottom'},
        E:{...E,s:3,gov:'C/12−0.7',note:'neck·width'}, F:{...F,s:3,gov:'0.5″',note:'neck·depth'},
        G:{...G,s:4,gov:'C↓1″',note:'shoulder·slope'},
      };},
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      return [
        {id:'fold_edge',s:2,color:'var(--purple)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'on fold'},
        {id:'top_edge',s:2,color:'var(--accent)',from:'C',to:'A',d:L(pt.C,pt.A),gov:'S/2'},
        {id:'open_edge',s:2,color:'var(--text3)',from:'C',to:'D',dash:true,d:L(pt.C,pt.D),gov:'C/12+0.5'},
        {id:'bottom_edge',s:2,color:'var(--text3)',from:'D',to:'B',dash:true,d:L(pt.D,pt.B),gov:'S/2'},
        {id:'yoke_neck',s:3,color:'var(--red)',from:'F',to:'E',man:true,d:qCurve(pt.F,pt.E),gov:'french · F→E'},
        {id:'shoulder_seam',s:4,color:'var(--accent)',from:'E',to:'G',d:L(pt.E,pt.G),gov:'E→G · slope 1″'},
      ];},
    steps:SHIRT_YOKE_STEPS,
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      if(cur>=2){ g+=dimH(sx(pt.C.x),sx(pt.A.x),sy(0)-16,`S/2 = ${fmt(m.S/2)}″`);
                  g+=dimV(sx(SW)+16,sy(0),sy(SH),`C/12+0.5 = ${fmt(m.C/12+0.5)}″`); }
      if(cur===3) g+=dimH(sx(pt.E.x),sx(pt.A.x),sy(0)-30,`C/12−0.7 = ${fmt(m.C/12-0.7)}″`);
      if(cur===4) g+=dimV(sx(pt.C.x)-16,sy(0),sy(pt.G.y),`1″`);
      return g; },
  };
  const INSTR_SHIRT_YOKE = {
    1:{draft:(v,m)=>[
        `Take a sheet ${fmt(m.S)}″ wide and ${fmt(m.C/12+0.5)}″ long, and fold it lengthwise so it becomes ${fmt(m.C/12+0.5)}″ × ${fmt(m.S/2)}″.`],
       sew:()=>"The yoke lies flat across the shoulders, sandwiching the front and back panels' raw shoulder edges between its two layers — cut 2 for a double (self-lined) yoke, or 1 on the fold for a single layer.",
       tip:()=>"A yoke of two layers (cut 4, or cut 2 on the fold) gives a cleaner, fully enclosed shoulder seam with no raw edges showing inside."},
    2:{draft:(v,m)=>[
        `Mark A at the top on the fold. From A measure ${fmt(m.C/12+0.5)}″ (C/12 + 0.5) down and mark B — the yoke length.`,
        `From A measure ${fmt(m.S/2)}″ (S/2) to the left and mark C — the yoke width, i.e. half the shoulder measurement.`],
       sew:null,
       tip:()=>"The yoke width matching S/2 exactly is what makes it slot precisely between the two shoulder tips of the front and back panels."},
    3:{draft:(v,m)=>[
        `From A measure ${fmt(m.C/12-0.7)}″ (C/12 − 0.7) to the left and mark E — the same neck-width formula as the front.`,
        `From A measure 0.5″ straight down and mark F.`,
        `With a French curve, join F to E — the yoke's own share of the back neckline.`],
       sew:()=>"E–F joins directly onto the back panel's own neck edge, continuing the same curve across the seam.",
       tip:()=>"Because this reuses the front's C/12−0.7 formula, the yoke neckline always matches the front neckline in width — check that they land on the same curve when you assemble."},
    4:{draft:(v,m)=>[
        `From C measure 1″ straight down and mark G.`,
        `Join E to G — the yoke's shoulder slope, the same flat 1″ drop used on the front.`],
       sew:()=>"E–G is stitched to the front panel's shoulder line (J–M) on one side, and to the back panel's shoulder edge on the other — the yoke is what actually carries the shoulder seam.",
       tip:()=>"Keep this slope identical to the front's (also 1″) — if they don't match, the finished shoulder will twist."},
  };
  SHIRT_YOKE.instr = INSTR_SHIRT_YOKE;

  /* ── Part 4 · Collar (5 steps) — drafted on the fold ── */
  const SHIRT_COLLAR_STEPS = [
    {n:1,en:'Fold the sheet',deps:[],formula:'sheet (N/2+1)×2 wide, 4 long → folded N/2+1'},
    {n:2,en:'Length & width',deps:['sheet'],formula:'A→B = 4″ · A→C = N/2+1'},
    {n:3,en:'Collar band',deps:['A','D'],formula:'E = B↑1″ · F = D↑1″'},
    {n:4,en:'Band shape',deps:['E','F'],formula:'G,H,I,J · french H→G, J→G',man:true},
    {n:5,en:'Collar shape',deps:['G'],formula:'K = E↑0.5″ · L = A↓0.5″ · french C→L, G→K',man:true},
  ];
  const SHIRT_COLLAR = {
    name:'Part 4 · Collar', scale:20, pad:36, mr:60, mb:24, foldDx:44,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G',H:'H',I:'I',J:'J',K:'K',Lp:'L'},
    labs:{A:'ur',B:'dr',C:'ul',D:'dl',E:'r',F:'l',G:'d',H:'l',I:'d',J:'r',K:'r',Lp:'r'},
    small:{G:1,H:1,I:1,J:1,K:1,Lp:1},
    sheet:(m)=>({W:m.N/2+1, H:4}),
    points:(m)=>{ const SW=m.N/2+1, SH=4;
      const A={x:SW,y:0}, B={x:SW,y:SH}, C={x:0,y:0}, D={x:0,y:SH};
      const E={x:SW,y:SH-1}, F={x:0,y:SH-1};
      const G={x:1,y:SH-1}, H={x:0,y:SH-0.2}, I={x:SW/2,y:SH}, J={x:SW,y:SH-0.8};
      const K={x:SW,y:SH-1.5}, Lp={x:SW,y:0.5};
      return {
        A:{...A,s:2,gov:'on fold',note:'fold·top'}, B:{...B,s:2,gov:'4″',note:'fold·bottom'},
        C:{...C,s:2,gov:'N/2+1',note:'point·top'}, D:{...D,s:2,gov:'ref',note:'point·bottom'},
        E:{...E,s:3,gov:'B↑1″',note:'band·fold side'}, F:{...F,s:3,gov:'D↑1″',note:'band·point side'},
        G:{...G,s:4,gov:'F→1″',note:'band·corner'}, H:{...H,s:4,gov:'D↑0.2″',note:''},
        I:{...I,s:4,gov:'mid B–D',note:''}, J:{...J,s:4,gov:'E↓0.2″',note:''},
        K:{...K,s:5,gov:'E↑0.5″',note:'stand·fold'}, Lp:{...Lp,s:5,gov:'A↓0.5″',note:'fall·fold'},
      };},
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      return [
        {id:'fold_edge',s:2,color:'var(--purple)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'on fold'},
        {id:'top_edge',s:2,color:'var(--accent)',from:'C',to:'A',d:L(pt.C,pt.A),gov:'N/2+1'},
        {id:'open_edge',s:2,color:'var(--text3)',from:'C',to:'D',dash:true,d:L(pt.C,pt.D),gov:'4″'},
        {id:'bottom_edge',s:2,color:'var(--text3)',from:'D',to:'B',dash:true,d:L(pt.D,pt.B),gov:'N/2+1'},
        {id:'band_top',s:3,color:'var(--accent)',from:'E',to:'F',d:L(pt.E,pt.F),gov:'E→F'},
        {id:'hi_ref',s:4,color:'var(--text3)',from:'H',to:'I',dash:true,d:L(pt.H,pt.I),gov:'reference'},
        {id:'band_corner',s:4,color:'var(--red)',from:'H',to:'G',man:true,d:qCurve(pt.H,pt.G),gov:'french · H→G'},
        {id:'band_shape',s:4,color:'var(--red)',from:'J',to:'G',man:true,d:qCurve(pt.J,pt.G),gov:'french · J→G'},
        {id:'collar_outer',s:5,color:'var(--blue)',from:'C',to:'Lp',man:true,d:qCurve(pt.Lp,pt.C),gov:'french · C→L'},
        {id:'collar_inner',s:5,color:'var(--blue)',from:'G',to:'K',man:true,d:qCurve(pt.K,pt.G),gov:'french · G→K'},
        {id:'collar_point',s:5,color:'var(--green)',from:'C',to:'G',d:L(pt.C,pt.G),gov:'C→G · front point edge'},
      ];},
    steps:SHIRT_COLLAR_STEPS,
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      if(cur>=2){ g+=dimH(sx(pt.C.x),sx(pt.A.x),sy(0)-16,`N/2+1 = ${fmt(m.N/2+1)}″`);
                  g+=dimV(sx(SW)+16,sy(0),sy(SH),`4″`); }
      if(cur===3) g+=dimV(sx(SW)+34,sy(pt.E.y),sy(SH),`1″`);
      if(cur===5){ g+=dimV(sx(SW)-14,sy(pt.K.y),sy(pt.E.y),`0.5″`);
                   g+=dimV(sx(SW)-14,sy(0),sy(pt.Lp.y),`0.5″`); }
      return g; },
  };
  const INSTR_SHIRT_COLLAR = {
    1:{draft:(v,m)=>[
        `Take a sheet ${fmt(m.N+2)}″ wide and 4″ long, and fold it lengthwise so it becomes 4″ × ${fmt(m.N/2+1)}″.`],
       sew:()=>"Cut 2 (an outer and an inner/facing piece) — the collar is always a two-layer piece so no raw edge shows once it's turned.",
       tip:()=>"Interface at least one of the two layers — a soft, uninterfaced collar won't stand up properly around the neck."},
    2:{draft:(v,m)=>[
        `Mark A at the top on the fold. From A measure 4″ straight down and mark B.`,
        `From A measure ${fmt(m.N/2+1)}″ (N/2 + 1) to the left and mark C — the collar width, and the collar's front point.`],
       sew:null,
       tip:(v,m)=>`N/2+1 = ${fmt(m.N/2+1)}″ ties the collar directly to the neck measurement — a snug collar band comes from getting N accurately measured, not from this formula.`},
    3:{draft:()=>[
        `From B measure 1″ straight up and mark E.`,
        `From D measure 1″ straight up and mark F. Join E to F.`,
        `The strip below E–F (down to the fold-bottom) is the collar band; everything above E–F is the collar fall.`],
       sew:()=>"E–F is an internal fold/seam line inside the collar piece, separating the stand (band) from the fall — many machine-made shirts sew this as a real seam between two separately-cut pieces.",
       tip:()=>"A 1″ band is a classic point-collar proportion — deepen it slightly for a taller stand-up collar."},
    4:{draft:()=>[
        `From F measure 1″ to the right and mark G.`,
        `From D measure 0.2″ straight up and mark H.`,
        `With a French curve, round H into G — this softens the front-bottom corner of the collar band.`,
        `Mark I at the midpoint of B–D (a reference only). From E measure 0.2″ down and mark J.`,
        `With a French curve, join J to G — this is the actual finished bottom edge of the collar band.`],
       sew:()=>"J–G is what gets sewn to the neckline (the front and yoke neck edges) — check its length against the combined front + yoke neck curve before cutting.",
       tip:()=>"The 0.2″ dips at H and J are small but deliberate — without them the band's bottom edge sits as a dead-straight line, which never sits flush against a curved neckline."},
    5:{draft:()=>[
        `From E measure 0.5″ straight up and mark K.`,
        `From A measure 0.5″ straight down and mark L.`,
        `With a French curve, join C to L — the collar's outer top edge.`,
        `With a French curve, join G to K — the collar's inner edge, just above the band.`,
        `Draw a straight line from C to G — the slanted front point of the collar.`],
       sew:()=>"C–L–…–K–G–C together form the whole cut edge of the collar piece; C–G is the classic pointed tip you see on a button-down shirt collar.",
       tip:()=>"Lengthen C (move it further left before this step) for a longer, more dramatic point; USHA's own proportion here gives a moderate, everyday point length."},
  };
  SHIRT_COLLAR.instr = INSTR_SHIRT_COLLAR;

  /* ── Part 5 · Sleeve (5 steps) — drafted on the fold; cap uses the same
        quarter-division French-curve construction as the kurta/blouse sleeve ── */
  const SHIRT_SLEEVE_STEPS = [
    {n:1,en:'Fold the sheet',deps:[],formula:'sheet (C/4+0.5)×2 wide, (SL−CF) long → folded C/4+0.5'},
    {n:2,en:'Length & width',deps:['sheet'],formula:'A→B = SL−CF · A→C = C/4+0.5'},
    {n:3,en:'Armhole ref & mohri',deps:['C'],formula:'E = C/12 · Mo = B←(CR/2+1.5)'},
    {n:4,en:'Cap (armhole)',deps:['A','E'],formula:'¼ A–E · I +0.5″ · J −0.4″ · 0.2″ split',man:true},
    {n:5,en:'Placket slit',deps:['B','Mo'],formula:'U = mid(Mo,B) · T = U↑(C/6+1)'},
  ];
  const SHIRT_SLEEVE = {
    name:'Part 5 · Sleeve', scale:14, pad:34, mr:66, mb:20, foldDx:52,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',Mo:'F',F:'H',G:'G',H:'I',I:'J',J:'K',U:'U',T:'T'},
    labs:{A:'r',B:'r',C:'l',D:'l',E:'l',Mo:'r',F:'l',G:'l',H:'l',I:'l',J:'l',U:'r',T:'r'},
    small:{F:1,G:1,H:1,I:1,J:1,U:1,T:1},
    sheet:(m)=>({W:m.C/4+0.5, H:m.SL-m.CF}),
    points:(m)=>{ const SW=m.C/4+0.5, SH=m.SL-m.CF, armSize=m.C/12, mori=m.CR/2+1.5;
      const A={x:SW,y:0}, B={x:SW,y:SH}, C={x:0,y:0}, D={x:0,y:SH};
      const E={x:0,y:armSize}, Mo={x:SW-mori,y:SH};
      const ax=E.x-A.x, ay=E.y-A.y; const along=t=>({x:A.x+t*ax,y:A.y+t*ay});
      const F=along(.25), G=along(.5), H=along(.75); // quarter-division (closest-to-A first)
      const dl=Math.hypot(ax,ay)||1, nx=ay/dl, ny=-ax/dl; // unit perpendicular
      const I={x:F.x+0.5*nx,y:F.y+0.5*ny}, J={x:H.x-0.4*nx,y:H.y-0.4*ny};
      const U={x:(Mo.x+B.x)/2,y:SH}, T={x:U.x,y:SH-(m.C/6+1)};
      return {
        A:{...A,s:2,gov:'on fold',note:'cap·peak'}, B:{...B,s:2,gov:'SL−CF',note:'fold·hem'},
        C:{...C,s:2,gov:'C/4+0.5',note:'open·top'}, D:{...D,s:2,gov:'ref',note:'open·hem'},
        E:{...E,s:3,gov:'C/12',note:'underarm'}, Mo:{...Mo,s:3,gov:'CR/2+1.5',note:'mohri'},
        F:{...F,s:4,gov:'¼ A–E',note:''}, G:{...G,s:4,gov:'½ A–E',note:'curve thru'}, H:{...H,s:4,gov:'¾ A–E',note:''},
        I:{...I,s:4,gov:'+0.5″',note:'bulge'}, J:{...J,s:4,gov:'−0.4″',note:'scoop'},
        U:{...U,s:5,gov:'mid Mo–B',note:''}, T:{...T,s:5,gov:'U↑C/6+1',note:'placket·top'},
      };},
    edges:(pt,m)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      const ax=pt.E.x-pt.A.x, ay=pt.E.y-pt.A.y, dl=Math.hypot(ax,ay)||1, nx=ay/dl, ny=-ax/dl;
      const capSplit=0.2, Jb={x:pt.J.x-capSplit*nx,y:pt.J.y-capSplit*ny};
      const front=crPath([pt.A,pt.I,pt.G,pt.J,pt.E]);
      const back =crPath([pt.A,pt.F,pt.G,Jb,pt.E]);
      return [
        {id:'fold_edge',s:2,color:'var(--purple)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'on fold'},
        {id:'top_edge',s:2,color:'var(--accent)',from:'C',to:'A',d:L(pt.C,pt.A),gov:'C/4+0.5'},
        {id:'open_edge',s:2,color:'var(--text3)',from:'C',to:'D',dash:true,d:L(pt.C,pt.D),gov:'SL−CF'},
        {id:'underarm_ref',s:3,color:'var(--text3)',from:'C',to:'E',dash:true,d:L(pt.C,pt.E),gov:'C/12'},
        {id:'chord',s:3,color:'var(--green)',from:'E',to:'Mo',d:L(pt.E,pt.Mo),gov:'E→Mo · underarm/mohri ref'},
        {id:'sleeve_hem',s:3,color:'var(--green)',from:'Mo',to:'B',d:L(pt.Mo,pt.B),gov:'B←CR/2+1.5'},
        {id:'ae_chord',s:4,color:'var(--text3)',from:'A',to:'E',dash:true,d:L(pt.A,pt.E),gov:'quarter ref'},
        {id:'front_cap',s:4,color:'var(--accent)',from:'A',to:'E',man:true,d:front,gov:'french · A·I·G·J·E'},
        {id:'back_cap',s:4,color:'var(--blue)',from:'A',to:'E',man:true,d:back,gov:`french · +${capSplit}″ split`},
        {id:'placket_slit',s:5,color:'var(--red)',from:'U',to:'T',d:L(pt.U,pt.T),gov:'C/6+1'},
      ];},
    steps:SHIRT_SLEEVE_STEPS,
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      if(cur>=2){ g+=dimH(sx(pt.C.x),sx(pt.A.x),sy(0)-16,`C/4+0.5 = ${fmt(m.C/4+0.5)}″`);
                  g+=dimV(sx(pt.A.x)+16,sy(0),sy(pt.B.y),`SL−CF = ${fmt(m.SL-m.CF)}″`); }
      if(cur===3){ g+=dimV(sx(pt.C.x)-16,sy(0),sy(pt.E.y),`C/12 = ${fmt(m.C/12)}″`);
                   g+=dimH(sx(pt.Mo.x),sx(pt.B.x),sy(SH)+18,`CR/2+1.5 = ${fmt(m.CR/2+1.5)}″`); }
      if(cur===4) g+=`<text class="dimtxt" x="${sx(SW*0.55)}" y="${sy(SH*0.65)}" fill="var(--accent2)" text-anchor="middle">I +0.5″ · J −0.4″ · split 0.2″</text>`;
      if(cur===5) g+=dimV(sx(pt.U.x)+16,sy(pt.T.y),sy(pt.U.y),`C/6+1 = ${fmt(m.C/6+1)}″`);
      return g; },
  };
  const INSTR_SHIRT_SLEEVE = {
    1:{draft:(v,m)=>[
        `Take a sheet ${fmt((m.C/4+0.5)*2)}″ wide and ${fmt(m.SL-m.CF)}″ long, and fold it lengthwise so it becomes ${fmt(m.SL-m.CF)}″ × ${fmt(m.C/4+0.5)}″.`,
        `The working length is the full sleeve length minus the cuff depth (SL − CF) — the cuff itself is a separate piece (Part 7) added on afterward.`],
       sew:()=>"Cut 2 on the fold, mirrored, for the left and right sleeves.",
       tip:()=>"Always subtract the cuff before drafting the sleeve body, or the finished sleeve ends up CF inches too long."},
    2:{draft:(v,m)=>[
        `Mark A at the top on the fold. From A measure ${fmt(m.SL-m.CF)}″ (SL − CF) straight down and mark B.`,
        `From A measure ${fmt(m.C/4+0.5)}″ (C/4 + 0.5) to the left and mark C — the sleeve width.`],
       sew:null,
       tip:(v,m)=>`Sleeve width ${fmt(m.C/4+0.5)}″ scales directly with the chest — a larger chest gets a proportionally roomier sleeve cap, which is what lets the two pieces ease together properly.`},
    3:{draft:(v,m)=>[
        `From C measure ${fmt(m.C/12)}″ (C/12) straight down and mark E — this is where the body's chest line will meet the sleeve.`,
        `From B measure ${fmt(m.CR/2+1.5)}″ (CR/2 + 1.5) to the left and mark Mo (the mohri) — the sleeve's finished hem opening, before the cuff is attached.`,
        `Join E to Mo — a straight reference line.`],
       sew:null,
       tip:(v,m)=>`The mohri (${fmt(m.CR/2+1.5)}″) is deliberately wider than the finished cuff round (${fmt(m.CR)}″) — the extra fabric is gathered or pleated into the cuff when it's attached.`},
    4:{draft:()=>[
        `Draw a straight line from A to E and divide it into 4 equal parts; mark the quarter points, closest to A first, as F, G, H.`,
        `From F, measure 0.5″ perpendicular to A–E (toward the open edge) and mark I — the crown of the cap.`,
        `From H, measure 0.4″ perpendicular to A–E (the other way) and mark J — the scoop just above the underarm.`,
        `With a French curve, draw the front cap through A · I · G · J · E.`,
        `Draw a second curve through A · F · G · J (offset 0.2″) · E — the back cap, kept 0.2″ inside the front near the scoop.`],
       sew:()=>"The front curve eases into the body's front armhole (Part 1), the back curve into the back armhole (Part 2) — that small 0.2″ difference is the ease that lets the cap sit smoothly without puckering.",
       tip:()=>"This is exactly the same quarter-division method used for the kurta and blouse sleeve caps — once you've drafted one, the rest follow the identical recipe."},
    5:{draft:(v,m)=>[
        `Find the midpoint of Mo–B (on the hem line) and mark U.`,
        `From U measure ${fmt(m.C/6+1)}″ (C/6 + 1) straight up and mark T. U–T is the sleeve placket slit.`],
       sew:()=>"Slash the sleeve fabric along U–T after cutting, and bind the raw edges with the placket facing piece from Part 6 — this is the opening the cuff buttons close over.",
       tip:()=>"Reinforce the top of the slit (near T) with a small bar tack or a tight triangle of stitching — this point takes the most strain every time the cuff is opened."},
  };
  SHIRT_SLEEVE.instr = INSTR_SHIRT_SLEEVE;

  /* ── Part 6 · Sleeve placket facing (1 step) — a fixed-size tab, the same
        for every size per the manual (no body-measurement formula given) ── */
  const SHIRT_PLACKET = {
    name:'Part 6 · Placket facing', fold:false, scale:22, pad:36, mr:56, mb:22, foldDx:0,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F'},
    labs:{A:'ul',B:'dl',C:'dr',D:'ur',E:'u',F:'u'}, small:{},
    sheet:()=>({W:5, H:7.5}),
    points:()=>({
      A:{x:0,y:0,s:1,gov:'origin',note:'top·point'}, B:{x:0,y:7.5,s:1,gov:'A↓7.5″',note:'bottom·left'},
      C:{x:5,y:7.5,s:1,gov:'B→5″',note:'bottom·right'}, D:{x:5,y:1,s:1,gov:'C↑6.5″',note:'shoulder'},
      E:{x:2,y:1,s:1,gov:'D←3″',note:'tab·base'}, F:{x:2,y:0,s:1,gov:'E↑1″',note:'tab·tip'},
    }),
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      return [
        {id:'pl_ab',s:1,color:'var(--accent)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'7.5″'},
        {id:'pl_bc',s:1,color:'var(--accent)',from:'B',to:'C',d:L(pt.B,pt.C),gov:'5″'},
        {id:'pl_cd',s:1,color:'var(--accent)',from:'C',to:'D',d:L(pt.C,pt.D),gov:'6.5″'},
        {id:'pl_de',s:1,color:'var(--accent)',from:'D',to:'E',d:L(pt.D,pt.E),gov:'3″'},
        {id:'pl_ef',s:1,color:'var(--accent)',from:'E',to:'F',d:L(pt.E,pt.F),gov:'1″'},
        {id:'pl_fa',s:1,color:'var(--accent)',from:'F',to:'A',d:L(pt.F,pt.A),gov:'2″'},
      ];},
    steps:[{n:1,en:'Placket tab',deps:[],formula:'fixed: 7.5×5 base, 3×1 pointed tab (all sizes)'}],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      g+=dimV(sx(pt.A.x)-16,sy(pt.A.y),sy(pt.B.y),`7.5″`);
      g+=dimH(sx(pt.B.x),sx(pt.C.x),sy(pt.B.y)+18,`5″`);
      g+=dimV(sx(pt.C.x)+16,sy(pt.D.y),sy(pt.C.y),`6.5″`);
      g+=dimH(sx(pt.E.x),sx(pt.D.x),sy(pt.D.y)-9,`3″`);
      g+=dimH(sx(pt.F.x),sx(pt.A.x),sy(0)-9,`2″`);
      return g; },
  };
  const INSTR_SHIRT_PLACKET = {
    1:{draft:()=>[
        `Mark A. From A measure 7.5″ straight down and mark B.`,
        `From B measure 5″ to the right and mark C.`,
        `From C measure 6.5″ straight up and mark D.`,
        `From D measure 3″ to the left and mark E, then 1″ straight up from E and mark F.`,
        `Join F back to A — a short 2″ top edge — closing the shape.`],
       sew:()=>"This facing binds the slit U–T cut into the sleeve (Part 5): the wide rectangle (A–B–C–D) covers the underlap side of the opening, and the narrower pointed tab (D–E–F) forms the visible overlap that the buttons sit on.",
       tip:()=>"Unlike every other piece in this shirt, the placket facing isn't scaled by C, S or SL — the manual cuts it to this fixed size for every body measurement, since it only has to match the sleeve slit's own fixed proportions."},
  };
  SHIRT_PLACKET.instr = INSTR_SHIRT_PLACKET;

  /* ── Part 7 · Cuff (3 steps) — drafted on the fold ── */
  const SHIRT_CUFF_STEPS = [
    {n:1,en:'Fold the sheet',deps:[],formula:'sheet (CR/2+0.75)×2 wide, CF long → folded CR/2+0.75'},
    {n:2,en:'Length & width',deps:['sheet'],formula:'A→B = CF · A→C = CR/2+0.75'},
    {n:3,en:'Cuff shape',deps:['D'],formula:'E = D↑0.75″ · F = D→0.75″',man:true},
  ];
  const SHIRT_CUFF = {
    name:'Part 7 · Cuff', scale:26, pad:36, mr:52, mb:26, foldDx:38,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F'},
    labs:{A:'ur',B:'dr',C:'ul',D:'dl',E:'l',F:'d'}, small:{E:1,F:1},
    sheet:(m)=>({W:m.CR/2+0.75, H:m.CF}),
    points:(m)=>{ const SW=m.CR/2+0.75, SH=m.CF;
      const A={x:SW,y:0}, B={x:SW,y:SH}, C={x:0,y:0}, D={x:0,y:SH};
      const E={x:0,y:SH-0.75}, F={x:0.75,y:SH};
      return {
        A:{...A,s:2,gov:'on fold',note:'fold·top'}, B:{...B,s:2,gov:'CF',note:'fold·bottom'},
        C:{...C,s:2,gov:'CR/2+0.75',note:'open·top'}, D:{...D,s:2,gov:'ref',note:'open·bottom'},
        E:{...E,s:3,gov:'D↑0.75″',note:''}, F:{...F,s:3,gov:'D→0.75″',note:''},
      };},
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      return [
        {id:'fold_edge',s:2,color:'var(--purple)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'on fold'},
        {id:'top_edge',s:2,color:'var(--accent)',from:'C',to:'A',d:L(pt.C,pt.A),gov:'CR/2+0.75'},
        {id:'open_edge',s:2,color:'var(--text3)',from:'C',to:'D',dash:true,d:L(pt.C,pt.D),gov:'CF'},
        {id:'cuff_shape',s:3,color:'var(--red)',from:'E',to:'F',man:true,d:qCurve(pt.E,pt.F),gov:'french · E→F'},
      ];},
    steps:SHIRT_CUFF_STEPS,
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      if(cur>=2){ g+=dimH(sx(pt.C.x),sx(pt.A.x),sy(0)-16,`CR/2+0.75 = ${fmt(m.CR/2+0.75)}″`);
                  g+=dimV(sx(SW)+16,sy(0),sy(SH),`CF = ${fmt(m.CF)}″`); }
      if(cur===3){ g+=dimV(sx(pt.C.x)-16,sy(pt.E.y),sy(SH),`0.75″`);
                   g+=dimH(sx(pt.C.x),sx(pt.F.x),sy(SH)+16,`0.75″`); }
      return g; },
  };
  const INSTR_SHIRT_CUFF = {
    1:{draft:(v,m)=>[
        `Take a sheet ${fmt((m.CR/2+0.75)*2)}″ wide and ${fmt(m.CF)}″ deep, and fold it in half so it becomes ${fmt(m.CF)}″ × ${fmt(m.CR/2+0.75)}″.`],
       sew:()=>"Cut 2 (an outer and an inner facing) for each cuff, so no raw edge shows once folded and topstitched — 4 pieces total for the pair of sleeves.",
       tip:()=>"Interface the outer layer so the cuff keeps a crisp edge and holds the buttonhole without stretching."},
    2:{draft:(v,m)=>[
        `Mark A at the top on the fold. From A measure ${fmt(m.CF)}″ (the cuff depth CF) down and mark B.`,
        `From A measure ${fmt(m.CR/2+0.75)}″ (CR/2 + 0.75) to the left and mark C — the cuff width.`],
       sew:null,
       tip:(v,m)=>`CR/2+0.75 adds a small button-stand allowance on top of half the wrist round (${fmt(m.CR/2)}″) — that's the overlap the button and buttonhole share.`},
    3:{draft:()=>[
        `From D measure 0.75″ straight up and mark E. From D measure 0.75″ to the right and mark F.`,
        `With a French curve, round E into F — the finished bottom corner of the cuff.`],
       sew:()=>"This rounded corner sits at the buttonhole end of the cuff — a sharp square corner here catches and frays far sooner than a curved one.",
       tip:()=>"The mirror corner (at C/A's side) is usually left square, since it sits under the overlapping placket and is never seen."},
  };
  SHIRT_CUFF.instr = INSTR_SHIRT_CUFF;

  /* ── Part 8 · Pocket (2 steps) — cut flat, not on the fold ── */
  const SHIRT_POCKET_STEPS = [
    {n:1,en:'Length & width',deps:[],formula:'A→B = C/6−1 · A→C = C/8'},
    {n:2,en:'Pocket shape',deps:['B'],formula:'rounded bottom corners (0.75″)',man:true},
  ];
  const SHIRT_POCKET = {
    name:'Part 8 · Pocket', fold:false, scale:24, pad:36, mr:56, mb:24, foldDx:0,
    letters:{A:'A',B:'B',C:'C',D:'D'}, labs:{A:'ur',B:'dr',C:'ul',D:'dl'}, small:{},
    sheet:(m)=>({W:m.C/8, H:m.C/6-1}),
    points:(m)=>{ const SW=m.C/8, SH=m.C/6-1;
      return {
        A:{x:SW,y:0,s:1,gov:'origin',note:'top·right'}, B:{x:SW,y:SH,s:1,gov:'C/6−1',note:'bottom·right'},
        C:{x:0,y:0,s:1,gov:'C/8',note:'top·left'}, D:{x:0,y:SH,s:1,gov:'ref',note:'bottom·left'},
      };},
    edges:(pt,m)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      const SW=m.C/8, SH=m.C/6-1, r=Math.min(0.75, SW/2, SH/2);
      const Bc1={x:pt.B.x,y:pt.B.y-r}, Bc2={x:pt.B.x-r,y:pt.B.y};
      const Dc1={x:pt.D.x+r,y:pt.D.y}, Dc2={x:pt.D.x,y:pt.D.y-r};
      const roundedHem=`M ${f2(pt.A.x)} ${f2(pt.A.y)} L ${f2(Bc1.x)} ${f2(Bc1.y)} `
        +`C ${f2(Bc1.x)} ${f2(Bc1.y+r*0.55)} ${f2(Bc2.x+r*0.45)} ${f2(Bc2.y)} ${f2(Bc2.x)} ${f2(Bc2.y)} `
        +`L ${f2(Dc1.x)} ${f2(Dc1.y)} `
        +`C ${f2(Dc1.x-r*0.45)} ${f2(Dc1.y)} ${f2(Dc2.x)} ${f2(Dc2.y-r*0.55)} ${f2(Dc2.x)} ${f2(Dc2.y)} `
        +`L ${f2(pt.C.x)} ${f2(pt.C.y)}`;
      return [
        {id:'top_edge',s:1,color:'var(--accent)',from:'C',to:'A',d:L(pt.C,pt.A),gov:'C/8 · pocket mouth'},
        {id:'right_edge',s:1,color:'var(--text3)',from:'A',to:'B',dash:true,d:L(pt.A,pt.B),gov:'C/6−1'},
        {id:'left_edge',s:1,color:'var(--text3)',from:'C',to:'D',dash:true,d:L(pt.C,pt.D),gov:'C/6−1'},
        {id:'pocket_shape',s:2,color:'var(--red)',from:'A',to:'C',man:true,d:roundedHem,gov:'rounded 0.75″'},
      ];},
    steps:SHIRT_POCKET_STEPS,
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      g+=dimH(sx(pt.C.x),sx(pt.A.x),sy(0)-16,`C/8 = ${fmt(m.C/8)}″`);
      g+=dimV(sx(SW)+16,sy(0),sy(SH),`C/6−1 = ${fmt(m.C/6-1)}″`);
      return g; },
  };
  const INSTR_SHIRT_POCKET = {
    1:{draft:(v,m)=>[
        `Mark A at the top-right. From A measure ${fmt(m.C/6-1)}″ (C/6 − 1) straight down and mark B.`,
        `From A measure ${fmt(m.C/8)}″ (C/8) to the left and mark C, then drop the same ${fmt(m.C/6-1)}″ from C to D.`],
       sew:null,
       tip:()=>"The USHA manual notes this pocket can be styled and sized however the wearer prefers — these formulas give a standard proportional starting point, not a fixed rule."},
    2:{draft:()=>[
        `Round off the two bottom corners of the rectangle (a 0.75″ radius works well) — a straight-edged pocket is a valid style too, but the rounded version turns out and presses more cleanly.`],
       sew:()=>"Press a 0.25″ turn-under all round, then topstitch the pocket to the front panel, positioned to your own preference relative to the chest line.",
       tip:()=>"Bar-tack both top corners of the pocket — these are the two points that take all the strain every time something is pulled out of it."},
  };
  SHIRT_POCKET.instr = INSTR_SHIRT_POCKET;


  /* ═══ FINISHED-SHIRT PREVIEW (static silhouette, highlighted per step) ═══
     A men's shirt front view: turn-down collar, front button placket, breast
     pocket, long sleeves gathered into a cuff. Same 140×200-ish viewBox
     convention as the kurta/blouse silhouettes. */
  const SHIRT_SIL = `M 61 21 C 57 23 52 24 47 25 C 39 30 33 37 30 46 C 36 52 43 55 49 56 C 50 82 51 96 51 110 C 51 128 47 142 45 152 C 44 167 41 178 40 188 Q 70 193 100 188 C 99 178 96 167 95 152 C 93 142 89 128 89 110 C 89 96 90 82 91 56 C 97 55 104 52 110 46 C 107 37 101 30 93 25 C 88 24 83 23 79 21 C 77 12 63 12 61 21 Z`;
  const SHIRT_HL = {
    length:   `M 70 26 L 70 188`,
    placket:  `M 70 26 L 70 188`,
    collar:   `M 61 21 C 63 14 77 14 79 21 L 75 25 C 71 22 69 22 65 25 Z`,
    yoke:     `M 51 26 L 89 26 L 87 34 L 53 34 Z`,
    neckline: `M 61 21 C 63 26 77 26 79 21`,
    shoulder: `M 61 21 C 57 23 52 24 47 25 M 79 21 C 83 23 88 24 93 25`,
    chest:    `M 50 67 L 90 67`,
    armhole:  `M 48 27 C 54 36 54 48 49 56 M 92 27 C 86 36 86 48 91 56`,
    side:     `M 49 56 C 50 82 51 96 51 110 C 51 128 47 142 45 152 C 44 167 41 178 40 188 M 91 56 C 90 82 89 96 89 110 C 89 128 93 142 95 152 C 96 167 99 178 100 188`,
    sleeve:   `M 47 25 C 39 30 33 37 30 46 C 36 52 43 55 49 56 M 93 25 C 101 30 107 37 110 46 C 104 52 97 55 91 56`,
    cuff:     `M 28 44 L 34 48.5 M 112 44 L 106 48.5`,
    hem:      `M 40 188 Q 70 193 100 188`,
    pocket:   `M 58 70 L 66 70 L 66 82 L 58 82 Z`,
  };

  /* ── shirt PARTS entry — 8 phases, 29 steps total, HL keyed by global step ── */
  PARTS.shirt = {
    label:'Men\u2019s Shirt', tag:"men's shirt \u00b7 front(1-5)\u00b7back(1-4)\u00b7yoke(1-4)\u00b7collar(1-5)\u00b7sleeve(1-5)\u00b7placket(1)\u00b7cuff(1-3)\u00b7pocket(1-2)",
    chart:'shirt',
    uses:['L','S','C','SL','N','CF','CR'],
    phases:[SHIRT_FRONT, SHIRT_BACK, SHIRT_YOKE, SHIRT_COLLAR, SHIRT_SLEEVE, SHIRT_PLACKET, SHIRT_CUFF, SHIRT_POCKET],
    garmentTitle:'Finished shirt \u2014 this step',
    garment:{ base:SHIRT_SIL, hl:SHIRT_HL, fold:{y1:14,y2:188}, HL:{
      1:{ids:['placket'],cap:'Front piece \u2014 cut flat (not on the fold): the 1.5\u2033 placket fold and 0.5\u2033 overlap sit inside the right-hand edge.'},
      2:{ids:['shoulder','chest'],cap:'Tira (S/2) at the shoulder, and the chest line (C/4+1.5) that fixes the armhole depth.'},
      3:{ids:['neckline'],cap:'Front neckline \u2014 depth and width both C/12\u22120.7, rounded with a French curve.'},
      4:{ids:['shoulder'],cap:'Shoulder slope \u2014 a flat 1\u2033 drop from the tira point, matched by the yoke\u2019s own slope.'},
      5:{ids:['armhole'],cap:'Front (and paired back) armhole curves, 0.5\u2033 apart, from the shoulder down to the chest line.'},
      6:{ids:['length'],cap:'Back piece, drafted on the fold \u2014 1\u2033 shorter than the front; the yoke restores that inch at the shoulder.'},
      7:{ids:['length'],cap:'Back length (L\u22121) and back width (C/4+1.5), matching the front chest line exactly.'},
      8:{ids:['shoulder','chest'],cap:'Back tira (S/2) and back chest line (C/4\u22121) \u2014 2\u2033 shallower than the front\u2019s.'},
      9:{ids:['armhole'],cap:'Back armhole \u2014 a single French curve from the tira point to the chest line.'},
      10:{ids:['yoke'],cap:'Yoke piece, drafted on the fold \u2014 sits across the shoulders between front and back.'},
      11:{ids:['yoke'],cap:'Yoke length (C/12+0.5) and width (S/2, half the shoulder measurement).'},
      12:{ids:['yoke','neckline'],cap:'Yoke neckline \u2014 the same C/12\u22120.7 formula as the front, continuing the same curve.'},
      13:{ids:['yoke','shoulder'],cap:'Yoke shoulder slope \u2014 the same flat 1\u2033 drop as the front, so the seam doesn\u2019t twist.'},
      14:{ids:['collar'],cap:'Collar piece, drafted on the fold \u2014 cut 2, an outer layer and a facing.'},
      15:{ids:['collar'],cap:'Collar length (4\u2033) and width (N/2+1, tied directly to the neck measurement).'},
      16:{ids:['collar'],cap:'Collar band \u2014 the bottom 1\u2033 strip that sits against the neckline.'},
      17:{ids:['collar'],cap:'Band shape \u2014 the softened front-bottom corner of the stand.'},
      18:{ids:['collar'],cap:'Collar shape \u2014 the outer top edge and the classic pointed front tip.'},
      19:{ids:['sleeve'],cap:'Sleeve piece, drafted on the fold \u2014 cut 2, mirrored.'},
      20:{ids:['sleeve'],cap:'Sleeve length (SL\u2212CF, the cuff is a separate piece) and width (C/4+0.5).'},
      21:{ids:['sleeve','cuff'],cap:'Armhole reference (C/12) and the mohri opening (CR/2+1.5) \u2014 gathered into the cuff later.'},
      22:{ids:['sleeve','armhole'],cap:'Sleeve cap \u2014 the same quarter-division French-curve method as the kurta/blouse sleeve.'},
      23:{ids:['sleeve','placket'],cap:'Sleeve placket slit (C/6+1 long) \u2014 where the cuff opening will be faced and bound.'},
      24:{ids:['placket'],cap:'The sleeve placket facing \u2014 a fixed-size tab, the same shape for every body size.'},
      25:{ids:['cuff'],cap:'Cuff piece, drafted on the fold \u2014 cut 2 per sleeve (outer + facing).'},
      26:{ids:['cuff'],cap:'Cuff depth (CF) and width (CR/2+0.75, half the wrist round plus a button stand).'},
      27:{ids:['cuff'],cap:'Cuff shape \u2014 the rounded corner at the buttonhole end.'},
      28:{ids:['pocket'],cap:'Pocket piece, cut flat \u2014 width C/8, length C/6\u22121.'},
      29:{ids:['pocket'],cap:'Pocket shape \u2014 rounded bottom corners; style and size are the wearer\u2019s own choice.'},
    }},
  };



  const ECO = PARTS.shirt;
  ECO.id = 'shirt';
  ECO.chartSizes = SHIRT_CHART;
  return ECO;
});
