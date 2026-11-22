/* SILAI Executable Craft Object
   id      : blouse
   kind    : garment
   deps    : kit, geometry, set-in-sleeve
   source  : USHA Silai School tailoring manual (Zarapkar drafting system) - Chapter 15 (blouse)
   This file is served from the SILAI object store (eco/manifest.json). The studio
   fetches it, checks its SHA-256 against the manifest, then runs the factory below.
   The drafting code inside is unchanged from the single-file studio. */
SILAI.define('blouse', ["kit", "geometry", "set-in-sleeve"], function (kit, geo, sleeve) {
  const { fmt, V, dimH, dimV, crPath } = kit;
  const { bezAt, maxLean, fmt2, KAPPA, f2, qCtrl, qCurve, vCurve, lin, skUnit, skArc, skAtLen } = geo;
  const { makeSleeve, INSTR_SLEEVE } = sleeve;
  const PARTS = {};   // this object's descriptor is written as PARTS.<id> below

  /* ═══ PARTS ═══════════════════════════════════════════════════════════ */
  /* ═══════════════════ BLOUSE (USHA Chapter 15) ═══════════════════════ */
  const BLOUSE_CHART = {
    small:  {C:32,S:14,  W:26,L:14,SL:7,  Bm:11},
    medium: {C:34,S:14.5,W:28,L:14,SL:6.5,Bm:11.5},
    large:  {C:36,S:15,  W:30,L:15,SL:7,  Bm:12},
  };
  const BLOUSE_SIL = `M 54 48 C 58 67 82 67 86 48 C 88 44 91 42 95 42 C 107 42 119 47 127 56 C 128 58 127 60 126 62 C 124 70 122 78 120 85 C 114 85 107 83 101 80 C 98 79 96 79 94 79 C 93 101 92 126 91 150 L 49 150 C 48 126 47 101 46 79 C 44 79 42 79 39 80 C 33 83 26 85 20 85 C 18 78 16 70 14 62 C 13 60 12 58 13 56 C 21 47 33 42 45 42 C 49 42 52 44 54 48 Z`;
  const BLOUSE_HL = {
    length:`M 70 67 L 70 148`,
    neckline:`M 54 48 C 58 67 82 67 86 48`,
    backneck:`M 57 48 C 60 59 80 59 83 48`,
    shoulder:`M 54 48 C 51 45 48 43 45 42 M 86 48 C 89 45 92 43 95 42`,
    chest:`M 46 79 L 94 79`,
    waist:`M 49 150 L 91 150`,
    armhole:`M 47 44 C 51 56 51 69 47 79 M 93 44 C 89 56 89 69 93 79`,
    side:`M 47 79 C 48 101 49 126 49 150 M 93 79 C 92 101 91 126 91 150`,
    sleeve:`M 95 42 C 107 42 119 47 127 56 C 124 70 122 78 120 85 C 114 85 107 83 101 80 M 45 42 C 33 42 21 47 13 56 C 16 70 18 78 20 85 C 26 85 33 83 39 80`,
    cap:`M 95 42 C 107 42 119 47 127 56 M 45 42 C 33 42 21 47 13 56`,
    belt:`M 50 141 L 90 141`,
    darts:`M 78 83 L 76 145 M 62 83 L 64 145`,
  };

  /* front armhole cubic M→E (leans right of C–L) — shared by points() and edges() */
  function bArm(M,E){ const ax=E.x-M.x, ay=E.y-M.y, al=Math.hypot(ax,ay)||1, aux=ax/al, auy=ay/al;
    let nx=auy, ny=-aux; if(nx<0){nx=-nx;ny=-ny;}
    const at=(t)=>({x:M.x+t*ax,y:M.y+t*ay}), c1=at(0.30), c2=at(0.72);
    return {nx,ny, f1:{x:c1.x+1.0*nx,y:c1.y+1.0*ny}, f2:{x:c2.x+0.7*nx,y:c2.y+0.7*ny},
                   b1:{x:c1.x+0.5*nx,y:c1.y+0.5*ny}, b2:{x:c2.x+0.2*nx,y:c2.y+0.2*ny}}; }
  // stitching-allowance legs: offset ±d square to the dart at its wide end, back to the apex
  function dartLegs(tip,base,d,axis){ const dx=tip.x-base.x, dy=tip.y-base.y, l=Math.hypot(dx,dy)||1;
    let ox=-dy/l*d, oy=dx/l*d;                       // default: square to the dart
    if(axis==='v'){ ox=0; oy=d; }                    // point sits on a vertical edge
    if(axis==='h'){ ox=d; oy=0; }                    // point sits on the hem
    const f=(n)=>n.toFixed(2);
    return `M ${f(tip.x+ox)} ${f(tip.y+oy)} L ${f(base.x)} ${f(base.y)} `
         + `M ${f(tip.x-ox)} ${f(tip.y-oy)} L ${f(base.x)} ${f(base.y)}`; }

  const BLOUSE_FRONT_STEPS = [
    {n:1,en:'Corners & tira',deps:[],formula:'sheet 15×10 · C = S/2'},
    {n:2,en:'Chest & waist lines',deps:['A'],formula:'D = C/4−1 · E = C/4+1 · F = W/4+1.25'},
    {n:3,en:'Neck box',deps:['A'],formula:'G = C/6 · H = C/12+0.5 · J = C/8'},
    {n:4,en:'Neck curves',deps:['H','G','J'],formula:'french H→G, H→J',man:true},
    {n:5,en:'Shoulder slope',deps:['C','H'],formula:'M = C/36−0.3',man:false},
    {n:6,en:'Armhole',deps:['M','E'],formula:'french M→E · split C–L · 0.5″',man:true},
    {n:7,en:'Bust & waist darts',deps:['P','E'],formula:'P = C/4+1 · 4 darts',man:true},
    {n:8,en:'Dart stitching area',deps:['P','V','W','T'],formula:'P,V,W ±1″ · T ±1.25″'},
    {n:9,en:'Belt (optional)',deps:['T','V'],formula:'T↑2.5 → T2 · Y↑0.5 → Z'},
  ];
  const BLOUSE_FRONT = {
    name:'Part 1 · Blouse front',
    scale:22, pad:38, mr:64, mb:22, foldDx:54,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G',H:'H',I:'I',J:'J',K:'K',Lp:'L',M:'M',P:'P',Q:'Q',R:'R',S:'S',T:'T',U:'U',V:'V',W:'W',X:'X',T2:'T2',Y:'Y',Z:'Z'},
    labs:{A:'r',B:'r',C:'u',D:'r',E:'l',F:'dl',G:'r',H:'u',I:'dl',J:'r',K:'ul',Lp:'dl',M:'ul',P:'r',Q:'u',R:'ul',S:'ur',T:'d',U:'dl',V:'l',W:'ul',X:'ur',T2:'dl',Y:'dr',Z:'ur'},
    small:{I:1,K:1,R:1,S:1,U:1,W:1,X:1,T2:1,Y:1},
    sheet:(m)=>({W:m.C/4+1, H:m.L}),
    points:(m)=>{ const SW=m.C/4+1, x=v=>SW-v, bn=m.C/8, Cx=x(m.S/2), chestY=m.C/4-1, nw=m.C/12+0.5;
      const P={x:SW,y:m.C/4+1}, Q={x:x(3.5),y:m.C/4+1}, R={x:x(3.5)-1.5,y:m.C/4+1}, S={x:x(3.5)+1.5,y:m.C/4+1};
      const E={x:x(m.C/4+1),y:chestY}, V={x:E.x,y:E.y+m.C/8};
      const M={x:Cx,y:m.C/36-0.3}, arm=bArm(M,E);
      const Wp=maxLean(M,arm.f1,arm.f2,E);                       // 7.8
      const T={x:Q.x,y:m.L}, T2={x:Q.x,y:m.L-2.5};               // 9.1
      const tY=(SW-V.x)/((T2.x-V.x)||1), Y={x:SW,y:V.y+tY*(T2.y-V.y)};   // 9.2
      const Z={x:SW,y:Y.y-0.5};                                  // 9.3
      return {
        A:{x:SW,y:0,s:1,gov:'on fold',note:'top·fold'}, B:{x:SW,y:m.L,s:1,gov:'L',note:'hem·fold'}, C:{x:Cx,y:0,s:1,gov:'S/2',note:'tira'},
        D:{x:SW,y:chestY,s:2,gov:'C/4−1',note:'chest·fold'}, E:{...E,s:2,gov:'C/4+1',note:'chest·side'}, F:{x:x(m.W/4+1.25),y:m.L,s:2,gov:'W/4+1.25',note:'waist·side'},
        G:{x:SW,y:m.C/6,s:3,gov:'C/6',note:'front neck'}, H:{x:x(nw),y:0,s:3,gov:'C/12+0.5',note:'neck width'}, I:{x:x(nw),y:m.C/6,s:3,gov:'box',note:''},
        J:{x:SW,y:bn,s:3,gov:'C/8',note:'back neck'}, K:{x:x(nw),y:bn,s:3,gov:'box',note:''},
        Lp:{x:Cx,y:chestY,s:5,gov:'C↓chest',note:'split ref'}, M:{...M,s:5,gov:'C/36−0.3',note:'shoulder tip'},
        P:{...P,s:7,gov:'C/4+1',note:'bust apex'}, Q:{...Q,s:7,gov:'P←3.5',note:'dart ctr'}, R:{...R,s:7,gov:'Q−1.5',note:''}, S:{...S,s:7,gov:'Q+1.5',note:''},
        T:{...T,s:7,gov:'↓hem',note:'waist dart'}, U:{x:Q.x,y:P.y+1,s:7,gov:'Q↓1',note:''},
        V:{...V,s:7,gov:'E↓C/8',note:'side dart'}, W:{...Wp,s:7,gov:'lean · M→E',note:''}, X:{x:(Wp.x+Q.x)/2,y:(Wp.y+Q.y)/2,s:7,gov:'mid W–Q',note:''},
        T2:{...T2,s:9,gov:'T↑2.5',note:'belt'}, Y:{...Y,s:9,gov:'V–T2 → fold',note:''}, Z:{...Z,s:9,gov:'Y↑0.5',note:'belt end'},
      };},
    edges:(pt)=>{ const L=(a,b)=>`M ${a.x} ${a.y} L ${b.x} ${b.y}`;
      const wF=pt.G.x-pt.H.x, wB=pt.J.x-pt.H.x;
      const frontNeck=`M ${pt.H.x} ${pt.H.y} C ${pt.H.x} ${(pt.H.y+(pt.G.y-pt.H.y)*0.55).toFixed(2)} ${(pt.G.x-wF*0.45).toFixed(2)} ${pt.G.y} ${pt.G.x} ${pt.G.y}`;
      const backNeck =`M ${pt.H.x} ${pt.H.y} C ${pt.H.x} ${(pt.H.y+(pt.J.y-pt.H.y)*0.5).toFixed(2)} ${(pt.J.x-wB*0.4).toFixed(2)} ${pt.J.y} ${pt.J.x} ${pt.J.y}`;
      const aP=pt.M, aF=pt.E, arm=bArm(aP,aF), f=(n)=>n.toFixed(2);
      const frontArm=`M ${aP.x} ${aP.y} C ${f(arm.f1.x)} ${f(arm.f1.y)} ${f(arm.f2.x)} ${f(arm.f2.y)} ${aF.x} ${aF.y}`;
      const backArm =`M ${aP.x} ${aP.y} C ${f(arm.b1.x)} ${f(arm.b1.y)} ${f(arm.b2.x)} ${f(arm.b2.y)} ${aF.x} ${aF.y}`;
      return [
        {id:'fold',s:1,color:'var(--purple)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'on fold'},
        {id:'top_edge',s:1,color:'var(--text3)',from:'C',to:'A',d:L(pt.C,pt.A),gov:'S/2'},
        {id:'chest_line',s:2,color:'var(--accent)',from:'E',to:'D',d:L(pt.E,pt.D),gov:'C/4+1'},
        {id:'waist_line',s:2,color:'var(--green)',from:'F',to:'B',d:L(pt.F,pt.B),gov:'W/4+1.25'},
        {id:'neck_box_l',s:3,color:'var(--text3)',from:'H',to:'I',dash:true,d:L(pt.H,pt.I),gov:'box'},
        {id:'back_box',s:3,color:'var(--text3)',from:'J',to:'K',dash:true,d:L(pt.J,pt.K),gov:'back box'},
        {id:'front_neck',s:4,color:'var(--red)',from:'H',to:'G',man:true,d:frontNeck,gov:'french front H→G'},
        {id:'back_neck',s:4,color:'var(--blue)',from:'H',to:'J',man:true,d:backNeck,gov:'french back H→J'},
        {id:'cl_vertical',s:5,color:'var(--text3)',from:'C',to:'Lp',dash:true,d:L(pt.C,pt.Lp),gov:'C–L split ref'},
        {id:'shoulder',s:5,color:'var(--accent)',from:'H',to:'M',d:L(pt.H,pt.M),gov:'slope C/36−0.3'},
        {id:'front_armhole',s:6,color:'var(--red)',from:'M',to:'E',man:true,d:frontArm,gov:'front · right of C–L'},
        {id:'back_armhole',s:6,color:'var(--blue)',from:'M',to:'E',man:true,d:backArm,gov:'back · left of C–L · 0.5″'},
        {id:'side_seam',s:7,color:'var(--red)',from:'E',to:'F',d:L(pt.E,pt.F),gov:'E→F side seam'},
        {id:'dart_bust',s:7,color:'var(--accent2)',from:'S',to:'P',d:L(pt.S,pt.P),gov:'bust dart S→P'},
        {id:'dart_side',s:7,color:'var(--accent2)',from:'R',to:'V',d:L(pt.R,pt.V),gov:'side dart R→V'},
        {id:'dart_waist',s:7,color:'var(--accent2)',from:'U',to:'T',d:L(pt.U,pt.T),gov:'waist dart U→T'},
        {id:'dart_four',s:7,color:'var(--accent2)',from:'W',to:'X',d:L(pt.W,pt.X),gov:'4th dart W→X'},
        // Step #8 · stitching area — allowance on each dart
        {id:'sew_bust',s:8,color:'var(--accent)',from:'P',to:'S',dash:true,d:dartLegs(pt.P,pt.S,1,'v'),gov:'P ±1″ → S'},
        {id:'sew_side',s:8,color:'var(--accent)',from:'V',to:'R',dash:true,d:dartLegs(pt.V,pt.R,1,'v'),gov:'V ±1″ → R'},
        {id:'sew_fourth',s:8,color:'var(--accent)',from:'W',to:'X',dash:true,d:dartLegs(pt.W,pt.X,1),gov:'W ±1″ → X'},
        {id:'sew_waist',s:8,color:'var(--accent)',from:'T',to:'Q',dash:true,d:dartLegs(pt.T,pt.Q,1.25,'h'),gov:'T ±1.25″ → Q'},
        // Step #9 · belt (South India) — optional
        {id:'belt_rise',s:9,color:'var(--text3)',from:'T',to:'T2',dash:true,d:L(pt.T,pt.T2),gov:'T ↑2.5″'},
        {id:'belt_line',s:9,color:'var(--green)',from:'V',to:'Z',d:`M ${pt.V.x} ${pt.V.y} L ${pt.T2.x} ${pt.T2.y} L ${pt.Z.x} ${pt.Z.y}`,gov:'V → T2 → Z'},
        {id:'belt_edge',s:9,color:'var(--text3)',from:'Y',to:'Z',dash:true,d:L(pt.Y,pt.Z),gov:'Y ↑0.5″'},
      ];},
    steps:BLOUSE_FRONT_STEPS,
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g=''; const foldX=sx(SW);
      if(cur>=1) g+=dimH(sx(pt.C.x),sx(pt.A.x),sy(0)-16,`S/2 = ${fmt(m.S/2)}″`);
      if(cur===1) g+=dimV(foldX+30,sy(0),sy(SH),`L = ${fmt(m.L)}″`);
      if(cur===2){ g+=dimV(foldX+16,sy(0),sy(pt.D.y),`C/4−1 = ${fmt(m.C/4-1)}″`);
        g+=dimH(sx(pt.E.x),sx(pt.D.x),sy(pt.D.y)-9,`C/4+1 = ${fmt(m.C/4+1)}″`);
        g+=dimH(sx(pt.F.x),sx(pt.B.x),sy(SH)+16,`W/4+1.25 = ${fmt(m.W/4+1.25)}″`); }
      if(cur===3){ g+=dimV(foldX+16,sy(0),sy(pt.G.y),`C/6 = ${fmt(m.C/6)}″`);
        g+=dimH(sx(pt.H.x),sx(pt.A.x),sy(0)-28,`C/12+0.5 = ${fmt(m.C/12+0.5)}″`); }
      if(cur===5) g+=`<text class="dimtxt" x="${sx(pt.M.x)-6}" y="${sy(pt.M.y)-6}" text-anchor="end" fill="var(--accent2)">C/36−0.3 = ${fmt(m.C/36-0.3)}″</text>`;
      if(cur===6) g+=`<text class="dimtxt" x="${sx(SW*0.55)}" y="${sy(SH*0.35)}" fill="var(--purple)" text-anchor="middle">armhole split ≤ 0.5″ at C–L</text>`;
      if(cur===7){ g+=dimV(foldX+16,sy(0),sy(pt.P.y),`C/4+1 = ${fmt(m.C/4+1)}″`);
        g+=`<text class="dimtxt" x="${sx(pt.Q.x)}" y="${sy(pt.P.y)+22}" text-anchor="middle" fill="var(--accent2)">4 darts · dart-to-dart 3.5″</text>`; }
      if(cur===8) g+=`<text class="dimtxt" x="${sx(SW*0.5)}" y="${sy(SH)+16}" text-anchor="middle" fill="var(--accent)">stitching area · P,V,W ±1″ · T ±1.25″</text>`;
      if(cur===9){ g+=dimV(sx(pt.T.x)-14,sy(pt.T2.y),sy(pt.T.y),`2.5″`);
        g+=`<text class="dimtxt" x="${sx(pt.V.x)+8}" y="${sy(pt.V.y)-8}" fill="var(--green)">belt · optional (South India)</text>`; }
      return g; },
  };

  const BLOUSE_BACK = {
    name:'Part 2 · Blouse back',
    scale:22, pad:38, mr:60, mb:22, foldDx:52,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G',H:'H',I:'I',J:'J',K:'K',Lp:'L',M:'M',P:'P',Q:'Q',T:'T'},
    labs:{A:'r',B:'r',C:'u',D:'r',E:'l',F:'dl',G:'r',H:'u',I:'dl',J:'r',K:'ul',Lp:'dl',M:'ul',P:'r',Q:'u',T:'d'},
    small:{Q:1,I:1,K:1},
    sheet:(m)=>({W:m.C/4+0.5, H:m.L-1}),                 // back: −0.5 width, −1 length
    points:(m)=>{ const SW=m.C/4+0.5, x=v=>SW-v, LB=m.L-1, nw=m.C/12+0.5, Cx=x(m.S/2), chestY=m.C/4-1;
      return {
        A:{x:SW,y:0,s:1,gov:'on fold',note:'top·fold'}, B:{x:SW,y:LB,s:1,gov:'L−1',note:'hem·fold'}, C:{x:Cx,y:0,s:1,gov:'S/2',note:'tira'},
        D:{x:SW,y:chestY,s:1,gov:'C/4−1',note:'chest·fold'}, E:{x:x(m.C/4+0.5),y:chestY,s:1,gov:'C/4+0.5',note:'chest·side'}, F:{x:x(m.W/4+1.25),y:LB,s:1,gov:'W/4+1.25',note:'waist·side'},
        // traced across from Part 1 — the back sheet carries the same neck box,
        // neck curves, shoulder slope and armhole (Part 2, Step #2 figure)
        H:{x:x(nw),y:0,s:1,gov:'C/12+0.5',note:'neck width'}, G:{x:SW,y:m.C/6,s:1,gov:'C/6',note:'front neck'},
        I:{x:x(nw),y:m.C/6,s:1,gov:'box',note:''}, J:{x:SW,y:m.C/8,s:1,gov:'C/8',note:'back neck'},
        K:{x:x(nw),y:m.C/8,s:1,gov:'box',note:''},
        M:{x:Cx,y:m.C/36-0.3,s:1,gov:'C/36−0.3',note:'shoulder tip'}, Lp:{x:Cx,y:chestY,s:1,gov:'C↓chest',note:'split ref'},
        P:{x:SW,y:m.C/4+1,s:2,gov:'C/4+1',note:'dart apex'}, Q:{x:x(3.5),y:m.C/4+1,s:2,gov:'P←3.5',note:'dart ctr'}, T:{x:x(3.5),y:LB,s:2,gov:'↓hem',note:'waist dart'},
      };},
    edges:(pt)=>{ const L=(a,b)=>`M ${a.x} ${a.y} L ${b.x} ${b.y}`, f=(n)=>n.toFixed(2);
      const wF=pt.G.x-pt.H.x, wB=pt.J.x-pt.H.x;
      const frontNeck=`M ${pt.H.x} ${pt.H.y} C ${pt.H.x} ${(pt.H.y+(pt.G.y-pt.H.y)*0.55).toFixed(2)} ${(pt.G.x-wF*0.45).toFixed(2)} ${pt.G.y} ${pt.G.x} ${pt.G.y}`;
      const backNeck =`M ${pt.H.x} ${pt.H.y} C ${pt.H.x} ${(pt.H.y+(pt.J.y-pt.H.y)*0.5).toFixed(2)} ${(pt.J.x-wB*0.4).toFixed(2)} ${pt.J.y} ${pt.J.x} ${pt.J.y}`;
      const arm=bArm(pt.M,pt.E);
      const frontArm=`M ${pt.M.x} ${pt.M.y} C ${f(arm.f1.x)} ${f(arm.f1.y)} ${f(arm.f2.x)} ${f(arm.f2.y)} ${pt.E.x} ${pt.E.y}`;
      const backArm =`M ${pt.M.x} ${pt.M.y} C ${f(arm.b1.x)} ${f(arm.b1.y)} ${f(arm.b2.x)} ${f(arm.b2.y)} ${pt.E.x} ${pt.E.y}`;
      return [
        {id:'fold',s:1,color:'var(--purple)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'on fold'},
        {id:'top_edge',s:1,color:'var(--text3)',from:'C',to:'A',d:L(pt.C,pt.A),gov:'S/2'},
        {id:'chest_line',s:1,color:'var(--accent)',from:'E',to:'D',d:L(pt.E,pt.D),gov:'C/4+0.5'},
        {id:'waist_line',s:1,color:'var(--green)',from:'F',to:'B',d:L(pt.F,pt.B),gov:'W/4+1.25'},
        {id:'side_seam',s:1,color:'var(--red)',from:'E',to:'F',d:L(pt.E,pt.F),gov:'E→F side'},
        {id:'neck_box_l',s:1,color:'var(--text3)',from:'H',to:'I',dash:true,d:L(pt.H,pt.I),gov:'box'},
        {id:'back_box',s:1,color:'var(--text3)',from:'J',to:'K',dash:true,d:L(pt.J,pt.K),gov:'back box'},
        {id:'front_neck',s:1,color:'var(--red)',from:'H',to:'G',man:true,d:frontNeck,gov:'french front H→G'},
        {id:'back_neck',s:1,color:'var(--blue)',from:'H',to:'J',man:true,d:backNeck,gov:'french back H→J'},
        {id:'cl_vertical',s:1,color:'var(--text3)',from:'C',to:'Lp',dash:true,d:L(pt.C,pt.Lp),gov:'C–L split ref'},
        {id:'shoulder',s:1,color:'var(--accent)',from:'H',to:'M',d:L(pt.H,pt.M),gov:'slope C/36−0.3'},
        {id:'front_armhole',s:1,color:'var(--red)',from:'M',to:'E',man:true,d:frontArm,gov:'front · right of C–L'},
        {id:'back_armhole',s:1,color:'var(--blue)',from:'M',to:'E',man:true,d:backArm,gov:'back · left of C–L · 0.5″'},
        {id:'dart_ctr',s:2,color:'var(--accent2)',from:'Q',to:'T',d:L(pt.Q,pt.T),gov:'waist dart Q→T'},
        {id:'dart_l',s:2,color:'var(--accent2)',from:'Q',to:'T',dash:true,d:`M ${(pt.Q.x-1.25).toFixed(2)} ${pt.B.y} L ${pt.Q.x} ${pt.Q.y}`,gov:'−1.25″'},
        {id:'dart_r',s:2,color:'var(--accent2)',from:'Q',to:'T',dash:true,d:`M ${(pt.Q.x+1.25).toFixed(2)} ${pt.B.y} L ${pt.Q.x} ${pt.Q.y}`,gov:'+1.25″'},
      ];},
    steps:[
      {n:1,en:'Frame & traced lines',deps:[],formula:'−1 len · −0.5 wid · neck · shoulder · armhole',man:true},
      {n:2,en:'Back waist dart',deps:['D'],formula:'Q = P←3.5 · T ±1.25 → Q',man:true},
    ],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g=''; const foldX=sx(SW);
      if(cur>=1){ g+=dimH(sx(pt.C.x),sx(pt.A.x),sy(0)-16,`S/2 = ${fmt(m.S/2)}″`);
        g+=dimV(foldX+30,sy(0),sy(SH),`L−1 = ${fmt(m.L-1)}″`);
        g+=dimH(sx(pt.E.x),sx(pt.D.x),sy(pt.D.y)-9,`C/4+0.5 = ${fmt(m.C/4+0.5)}″`); }
      if(cur===2) g+=`<text class="dimtxt" x="${sx(pt.Q.x)}" y="${sy(pt.B.y)+14}" text-anchor="middle" fill="var(--accent2)">±1.25″ waist dart</text>`;
      return g; },
  };

  const BLOUSE_SLEEVE = makeSleeve('Part 3 · Sleeve', 0.5);   // Part 3, Step #4.6

  /* ── blouse instructions (functions of live values) ── */
  const INSTR_BFRONT = {
    1:{draft:(v)=>[`Take a sheet ${fmt(v.L)}″ long and ${fmt(v.chestWidth)}″ wide (C/4+1). The right edge is the centre-front fold.`,
        "Mark A at the top on the fold — the origin.",
        `A ↓ ${fmt(v.L)}″ (Length) → B. A ← ${fmt(v.tira)}″ (S/2) → C, the tira (shoulder point).`],
       sew:()=>"The blouse front is drafted flat on the fold; cut the front on the fabric fold so it opens symmetric.",
       tip:()=>"A blouse is short — the whole length here is only the bodice, not a full kurti."},
    2:{draft:(v)=>[`A ↓ ${fmt(v.chestStart)}″ (C/4−1) → D. From D, ← ${fmt(v.chestWidth)}″ (C/4+1) → E: the chest line D–E.`,
        `B ← ${fmt(v.bWaist)}″ (W/4+1.25) → F: the waist line B–F.`,
        "The blouse nips in from chest (10″) to waist (8.75″) — that shaping is taken out later as darts."],
       sew:()=>"Chest and waist lines are references; the side seam runs E→F and the darts do the fitting.",
       tip:(v)=>`Waist ${fmt(v.bWaist)}″ = W/4 + 1.25 — a touch more ease than the kurti's W/4 + 1.`},
    3:{draft:(v)=>[`A ↓ ${fmt(v.neckDepth)}″ (C/6) → G (front neck depth). A ← ${fmt(v.bNeckWidth)}″ (C/12+0.5) → H (neck width).`,
        `Drop H to G's level → I, and join H–I (neck box). A ↓ ${fmt(v.bBackNeck)}″ (C/8) → J (back neck depth); J ← ${fmt(v.bNeckWidth)}″ → K.`],
       sew:()=>null,
       tip:()=>"Blouse neck width is C/12 + 0.5 — half an inch wider than the kurti, for the deeper blouse neckline."},
    4:{draft:()=>["French curve H → G — the front neckline (leaves H vertically, meets G flat).",
        "French curve H → J — the back neckline (shallower, since J is higher than G)."],
       sew:()=>"Finish both neck edges with bias binding or a facing; stay-stitch first so the curve can't stretch.",
       tip:()=>"Front and back necklines share H, so they meet cleanly at the shoulder seam."},
    5:{draft:(v)=>[`From C, drop a line to the chest line → L (this vertical is the armhole split reference).`,
        `C ↓ ${fmt(v.bShoulderSlope)}″ (C/36−0.3) → M (shoulder tip). Join H → M — the shoulder seam.`],
       sew:()=>"Join front & back shoulders along H–M; press the seam toward the back.",
       tip:(v)=>`The blouse shoulder drop is ${fmt(v.bShoulderSlope)}″ (C/36−0.3) — a hair more than the kurti's C/36−0.2.`},
    6:{draft:()=>["French curve M → E for the armhole.",
        "Draw it twice, split by the C–L vertical: front (straight arm) to the right of C–L, back (reverse arm) to the left.",
        "Keep the two curves no more than 0.5″ apart — that is the standard difference."],
       sew:()=>"The sleeve cap (Part 3) eases into this armhole. Notch the shoulder tip and underarm to match.",
       tip:()=>"Same rule as the kurti armhole — front rides the fold side of the split line, back the arm side."},
    7:{draft:(v)=>[`A ↓ ${fmt(v.mainDart)}″ (C/4+1) → P — the bust apex. P ← 3.5″ → Q (dart-to-dart); Q ± 1.5″ → R, S.`,
        `Q ↓ to hem → T, Q ↓ 1″ → U: the waist dart U–T. E ↓ ${fmt(v.thirdDart)}″ (C/8) → V.`,
        "Draw the four darts: bust S→P, side R→V, waist U→T, and W→X (W = C–L ∩ R–V, X = mid W–Q)."],
       sew:()=>"Fold and stitch each dart toward its apex (the bust point P), then press bust/side darts down and the waist dart toward centre. Darts give the blouse its shape.",
       tip:()=>"All darts point at the bust apex P — that is what turns a flat panel into a fitted blouse."},
  };
  const INSTR_BBACK = {
    1:{draft:(v)=>[`Fold a sheet ${fmt(v.L-1)}″ × ${fmt(v.C/4+0.5)}″ — 1″ shorter and 0.5″ narrower than the front. Mark the chest line C/4+0.5 and the waist W/4+1.25.`,
        `Now trace the Part-1 construction across onto this sheet: the neck box (A ↓ C/6 → G, A ← ${fmt(v.bNeckWidth)}″ → H, A ↓ C/8 → J), both neck curves from H, the C–L vertical and the shoulder slope H → M.`,
        `Carry the armhole over too — French curve M → E, front and back split by C–L. The back panel needs all of it to match the front at the seams.`],
       sew:()=>"Cut the back on the fold; the reduced width keeps the side seams matching the front.",
       tip:()=>"Back length = front − 1″; back chest = C/4 + 0.5 (vs front C/4 + 1) — hence 0.5″ narrower."},
    2:{draft:()=>["Mark the dart centre Q (P ← 3.5″) and drop Q → T at the hem.",
        "At the hem, measure 1.25″ each side of T and taper both up to Q — the back waist dart."],
       sew:()=>"Stitch the back waist dart toward Q and press toward centre-back.",
       tip:()=>"One clean waist dart is usually enough at the back — the shaping there is gentler than the front."},
  };
  BLOUSE_FRONT.instr = INSTR_BFRONT;
  BLOUSE_BACK.instr  = INSTR_BBACK;
  BLOUSE_SLEEVE.instr = INSTR_SLEEVE;

  /* ── parametric blouse-preview generator (drives the finished-blouse illustration) ── */
  function blouseGarment(m){
    const C=m.C,W=m.W,S=m.S,L=m.L,SL=m.SL,B=m.Bm;
    const NWd=C/12+0.5, ND=C/6, BND=C/8, SH=S/2, SS=C/36-0.3, CP=C/4-1, CH=C/4+1, WH=W/4+1.25, mori=B/2, slProj=SL*0.9;
    // right-half key points (inches, x>=0 from centre, y down)
    const HR={x:NWd,y:0}, G={x:0,y:ND}, M={x:SH,y:SS}, E={x:CH,y:CP}, F={x:WH,y:L};
    // the sleeve is a cone set into the armhole chord M→E and drooped downward:
    // ax = the chord normal rotated DROOP toward the hem, cw = the mori edge direction
    const aL=Math.hypot(E.x-M.x,E.y-M.y)||1, dxn=(E.x-M.x)/aL, dyn=(E.y-M.y)/aL;
    const DROOP=45*Math.PI/180, cs=Math.cos(DROOP), sn=Math.sin(DROOP);
    const ax={x:dyn*cs+dxn*sn, y:dyn*sn-dxn*cs};            // sleeve axis · out and down
    const cw={x:-ax.y, y:ax.x};                             // down the mori edge
    const mid={x:(M.x+E.x)/2, y:(M.y+E.y)/2};
    const cc={x:mid.x+slProj*ax.x, y:mid.y+slProj*ax.y};    // centre of the mori edge
    const capO={x:cc.x-(mori/2)*cw.x, y:cc.y-(mori/2)*cw.y};  // outer top of the sleeve
    const slO ={x:cc.x+(mori/2)*cw.x, y:cc.y+(mori/2)*cw.y};  // outer hem · mori = B/2
    // named control points — shared by the outline and the highlight paths
    const along=(a,b,t,o,v)=>({x:a.x+(b.x-a.x)*t+o*v.x, y:a.y+(b.y-a.y)*t+o*v.y});
    const shC1={x:(NWd+SH)/2,y:SS*0.3}, shC2={x:SH-0.5,y:SS};
    const capC1=along(M,capO,0.35,-0.75,cw), capC2=along(M,capO,0.78,-0.55,cw);
    const cufC1=along(capO,slO,0.30,0.35,ax), cufC2=along(capO,slO,0.70,0.35,ax);
    const uaC1=along(slO,E,0.35,0.35,cw),     uaC2=along(slO,E,0.72,0.25,cw);
    const sdC1={x:(E.x+F.x)/2+0.5,y:(E.y+F.y)/2}, sdC2={x:F.x+0.3,y:F.y-1.6};
    const hmC1={x:WH*0.6,y:L}, hmC2={x:WH*0.3,y:L};
    // armhole M→E is a scoop, not a chord: offset the controls square to M–E and
    // toward the centre front, the same way the Part-1 draft builds it
    const aLb=Math.hypot(E.x-M.x,E.y-M.y)||1, auxb=(E.x-M.x)/aLb, auyb=(E.y-M.y)/aLb;
    const anxb=-auyb, anyb=auxb;                       // square to M–E, pointing inward
    const apb=(t)=>({x:M.x+t*(E.x-M.x), y:M.y+t*(E.y-M.y)});
    const ahC1={x:apb(0.30).x+1.10*anxb, y:apb(0.30).y+1.10*anyb};
    const ahC2={x:apb(0.72).x+0.80*anxb, y:apb(0.72).y+0.80*anyb};
    // right-half outline segments HR -> hemCentre, each a cubic {c1,c2,end}
    const R=[
      {c1:shC1, c2:shC2,  end:M},           // shoulder
      {c1:capC1,c2:capC2, end:capO},        // sleeve cap · slopes downward
      {c1:cufC1,c2:cufC2, end:slO},         // sleeve hem · mori
      {c1:uaC1, c2:uaC2,  end:E},           // underarm back up to the armpit
      {c1:sdC1, c2:sdC2,  end:F},           // side seam (tapers in)
      {c1:hmC1, c2:hmC2,  end:{x:0,y:L}},   // hem -> centre
    ];
    // interior construction points — the very numbers Part 1 drafts with, so the
    // little blouse carries the same darts the manual's step thumbnails show
    const bustY=C/4+1;
    const dP={x:0,y:bustY}, dQ={x:3.5,y:bustY}, dR={x:5,y:bustY}, dS={x:2,y:bustY};
    const dU={x:3.5,y:bustY+1}, dT={x:3.5,y:L}, dV={x:CH,y:CP+C/8};
    const dW=maxLean(M,ahC1,ahC2,E), dX={x:(dW.x+dQ.x)/2,y:(dW.y+dQ.y)/2};
    const dT2={x:3.5,y:L-2.5};
    const tYb=(0-dV.x)/((dT2.x-dV.x)||1), dY={x:0,y:dV.y+tYb*(dT2.y-dV.y)}, dZ={x:0,y:dY.y-0.5};
    const neckL={c1:{x:-NWd,y:ND*0.55},c2:{x:-NWd*0.45,y:ND},end:G};
    const neckR={c1:{x:NWd*0.45,y:ND},c2:{x:NWd,y:ND*0.55},end:HR};
    // assemble full path (inches)
    const HL={x:-NWd,y:0};
    let segs=[];
    segs.push(['M',HL]);
    segs.push(['C',neckL.c1,neckL.c2,neckL.end]);
    segs.push(['C',neckR.c1,neckR.c2,neckR.end]);
    R.forEach(s=>segs.push(['C',s.c1,s.c2,s.end]));
    // left = mirror(reverse(R)) : from hemCentre back up to HL
    let prev={x:0,y:L};
    for(let i=R.length-1;i>=0;i--){ const s=R[i];
      const start = i===0 ? HR : R[i-1].end;                 // original start of segment i
      // reverse cubic: prev(=s.end mirrored side) -> start, controls swapped, x negated
      segs.push(['C',{x:-s.c2.x,y:s.c2.y},{x:-s.c1.x,y:s.c1.y},{x:-start.x,y:start.y}]);
      prev={x:-start.x,y:start.y};
    }
    segs.push(['Z']);
    // ---- fit to viewBox: collect all pts, scale, centre ----
    const pts=[]; segs.forEach(s=>{ for(let i=1;i<s.length;i++) pts.push(s[i]); });
    const xs=pts.map(p=>p.x), ys=pts.map(p=>p.y);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const spanX=maxX-minX, spanY=maxY-minY;
    const TW=134, TH=168, k=Math.min(TW/spanX, TH/spanY);
    const ox=70-((minX+maxX)/2)*k, oy=97-((minY+maxY)/2)*k;
    const T=p=>({x:p.x*k+ox, y:p.y*k+oy});
    const base=segs.map(s=> s[0]==='M'?`M ${fmt2(T(s[1]))}`: s[0]==='Z'?'Z': `C ${fmt2(T(s[1]))} ${fmt2(T(s[2]))} ${fmt2(T(s[3]))}`).join(' ');
    // ---- highlights (same transform) ----
    const seg=(a,b)=>`M ${fmt2(T(a))} L ${fmt2(T(b))}`;
    const cub=(a,c1,c2,e)=>`M ${fmt2(T(a))} C ${fmt2(T(c1))} ${fmt2(T(c2))} ${fmt2(T(e))}`;
    const mir=(p)=>({x:-p.x,y:p.y});                       // left half = mirror of right
    const pair=(a,c1,c2,e)=>cub(a,c1,c2,e)+' '+cub(mir(a),mir(c1),mir(c2),mir(e));
    const segM=(a,b)=>seg(a,b)+' '+seg(mir(a),mir(b));
    // Step #8 wedge: ±d at the wide end of a dart, both legs back to its apex
    const wedge=(tip,base,d,axis)=>{ const dx=tip.x-base.x, dy=tip.y-base.y, l=Math.hypot(dx,dy)||1;
      let ox=-dy/l*d, oy=dx/l*d;
      if(axis==='v'){ox=0;oy=d;} if(axis==='h'){ox=d;oy=0;}
      return segM({x:tip.x+ox,y:tip.y+oy},base)+' '+segM({x:tip.x-ox,y:tip.y-oy},base); };
    const dartsPath = segM(dS,dP)+' '+segM(dU,dT)+' '+segM(dR,dV)+' '+segM(dW,dX);
    const plain = dartsPath+' '+segM({x:0,y:CP},{x:CH*0.92,y:CP});   // darts + chest line
    const hl={
      length: seg({x:0,y:ND},{x:0,y:L-0.5}),
      neckline: `M ${fmt2(T(HL))} C ${fmt2(T(neckL.c1))} ${fmt2(T(neckL.c2))} ${fmt2(T(G))} C ${fmt2(T(neckR.c1))} ${fmt2(T(neckR.c2))} ${fmt2(T(HR))}`,
      backneck: `M ${fmt2(T({x:-NWd*0.85,y:0}))} C ${fmt2(T({x:-NWd*0.3,y:BND}))} ${fmt2(T({x:NWd*0.3,y:BND}))} ${fmt2(T({x:NWd*0.85,y:0}))}`,
      shoulder: pair(HR,shC1,shC2,M),
      chest: seg({x:-CH,y:CP},{x:CH,y:CP}),
      waist: seg({x:-WH,y:L},{x:WH,y:L}),
      armhole: pair(M,ahC1,ahC2,E),
      side: pair(E,sdC1,sdC2,F),
      sleeve: pair(M,capC1,capC2,capO)+' '+pair(capO,cufC1,cufC2,slO)+' '+pair(slO,uaC1,uaC2,E),
      cap: pair(M,capC1,capC2,capO),
      mori: pair(capO,cufC1,cufC2,slO)+' '+pair(slO,uaC1,uaC2,E),
      darts: dartsPath,
      sew: wedge(dP,dS,1,'v')+' '+wedge(dV,dR,1,'v')+' '+wedge(dW,dX,1)+' '+wedge(dT,dQ,1.25,'h'),
      belt: `M ${fmt2(T(dV))} L ${fmt2(T(dT2))} L ${fmt2(T(dZ))}`
          + ` M ${fmt2(T(mir(dV)))} L ${fmt2(T(mir(dT2)))} L ${fmt2(T(dZ))}`,
      backdart: segM(dQ,{x:dQ.x,y:L-1}),
    };
    const tl=T({x:minX,y:minY}), br=T({x:maxX,y:maxY});
    return {base,hl,plain,fold:{y1:T({x:0,y:0}).y, y2:T({x:0,y:L}).y},
            box:{y0:Math.min(tl.y,br.y), y1:Math.max(tl.y,br.y)}};
  }


    PARTS.blouse = {
      label:'Blouse', tag:'blouse · front (1–9) + back (1–2) + sleeve (1–4)', chart:'blouse',
      uses:['C','S','W','L','SL','Bm'],
      phases:[BLOUSE_FRONT, BLOUSE_BACK, BLOUSE_SLEEVE],
      garmentTitle:'Finished blouse — this step',
      garment:{ gen:blouseGarment, HL:{
        1:{ids:['length'],cap:'Front drafted on the fold — the centre line is the blouse length.'},
        2:{ids:['chest','waist'],cap:'Chest line (C/4+1) and waist line (W/4+1.25) — the blouse nips in between.'},
        3:{ids:['neckline'],cap:'Neck box: depth C/6, width C/12+0.5.'},
        4:{ids:['neckline','backneck'],cap:'Both neck curves from H — front C/6 (solid), back C/8 (dashed).'},
        5:{ids:['shoulder'],cap:'Shoulder slope C/36−0.3 — the seam H→M.'},
        6:{ids:['armhole'],cap:'Armhole M→E, split by the C–L line — front and back curves 0.5″ apart.'},
        7:{ids:['darts'],cap:'Four darts converging on the bust apex — this is what fits the blouse.'},
        8:{ids:['sew'],cap:'Stitching area — the wedge on each dart: ±1″ at P, V, W and ±1.25″ at T.'},
        9:{ids:['belt'],cap:'Belt (South India) — optional; V → T2 → Z, 2.5″ above the hem.'},
        10:{ids:['side'],cap:'Back panel — 1″ shorter, 0.5″ narrower, with the neck, shoulder and armhole traced across.'},
        11:{ids:['backdart'],cap:'Back waist dart (±1.25″ at the waist, tapering to Q).'},
        12:{ids:['sleeve'],cap:'Part 3 · the sleeve — cut on the fold, mirrored to full width.'},
        13:{ids:['sleeve'],cap:'Sleeve length (A→C) and bicep width (C/4−0.5).'},
        14:{ids:['mori'],cap:'Sleeve hem / mori (B/2) and sleeve shape — the hem edge and the underarm seam D→E.'},
        15:{ids:['armhole'],cap:'Armhole — the cap is eased into this seam, where the sleeve meets the body.'},
      }},
    };

  const ECO = PARTS.blouse;
  ECO.id = 'blouse';
  ECO.chartSizes = BLOUSE_CHART;
  return ECO;
});
