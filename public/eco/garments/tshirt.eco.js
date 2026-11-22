/* SILAI Executable Craft Object
   id      : tshirt
   kind    : garment
   deps    : kit, geometry
   source  : Corpus formula vocabulary (shirt, blouse and kurta rules)
   note    : Not in the USHA manual; sleeve width solved so cap length equals armhole length
   This file is served from the SILAI object store (eco/manifest.json). The studio
   fetches it, checks its SHA-256 against the manifest, then runs the factory below.
   The drafting code inside is unchanged from the single-file studio. */
SILAI.define('tshirt', ["kit", "geometry"], function (kit, geo) {
  const { fmt, V, dimH, dimV, crPath } = kit;
  const { bezAt, maxLean, fmt2, KAPPA, f2, qCtrl, qCurve, vCurve, lin, skUnit, skArc, skAtLen } = geo;
  const PARTS = {};   // this object's descriptor is written as PARTS.<id> below

  /* ═══════════════════════════════════════════════════════════════════
     UNISEX T-SHIRT (knit) — four parts: 1 front · 2 back · 3 sleeve · 4 neckband
     NOT in the USHA manual. A boxy unisex crew-neck tee written in the corpus
     formula vocabulary, so nothing is a free constant:
       · body width C/4+1.5 (6″ ease round the chest) — the shirt's chest-line width
       · armhole depth C/4 — the shirt's chest point
       · neck width = front depth = C/12+0.5 — the blouse neck width; equal width
         and depth is a round crew neck, as the shirt makes its neck from C/12−0.7
       · back neck 0.75″, shoulder drop 1″ — the shirt's flat 1″ slope
       · armhole: the kurta's French-curve construction, front/back 0.5″ split
       · sleeve cap height C/12 with the corpus quarter-division cap (I +0.5″,
         J −0.4″, back 0.2″ deeper)
     Two things are SOLVED rather than ruled:
       · the sleeve width W is root-found so the two cap curves together are
         exactly as long as the two armhole curves (knit: zero ease), which is
         the fix the woven sleeves still lack;
       · the neckband is 0.85 × the drafted neckline length (standard rib ratio).
     ═══════════════════════════════════════════════════════════════════ */
  const TSHIRT_CHART = {          // body chest; unisex S/M/L
    small:  {C:36, S:16, L:26, SL:7.5},
    medium: {C:40, S:17, L:27, SL:8},
    large:  {C:44, S:18, L:28, SL:8.5},
  };
  const TS_RIB = 0.85;
  // length of the same Catmull-Rom path crPath draws
  function crLen(pts){ let len=0;
    for(let i=0;i<pts.length-1;i++){
      const p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||pts[i+1];
      const c1={x:p1.x+(p2.x-p0.x)/6, y:p1.y+(p2.y-p0.y)/6};
      const c2={x:p2.x-(p3.x-p1.x)/6, y:p2.y-(p3.y-p1.y)/6};
      len+=skArc(p1,c1,c2,p2,60).len; }
    return len; }

  /* body skeleton — front, back, sleeve solver, neckband and preview all read it */
  function tsGeom(m){
    const SW=m.C/4+1.5, nw=m.C/12+0.5;
    const A={x:SW,y:0}, B={x:SW,y:m.L}, C={x:0,y:m.L};
    const D={x:SW-m.S/2,y:0}, E={x:SW,y:m.C/4}, F={x:0,y:m.C/4};
    const M={x:SW-nw,y:0}, K={x:SW,y:nw}, Lp={x:M.x,y:K.y}, N={x:SW,y:0.75};
    const P={x:D.x,y:1}, Q={x:D.x,y:F.y};
    // neck curves — the kurta's construction: vertical at M, flat into K / N
    const wF=K.x-M.x, wB=N.x-M.x;
    const fn=[{x:M.x,y:M.y+(K.y-M.y)*0.55},{x:K.x-wF*0.45,y:K.y}];
    const bn=[{x:M.x,y:M.y+(N.y-M.y)*0.5},{x:N.x-wB*0.4,y:N.y}];
    // armhole P→F — the kurta's construction, front scooped, back 0.5″ shallower
    const ax=F.x-P.x, ay=F.y-P.y, al=Math.hypot(ax,ay)||1, ux=ax/al, uy=ay/al;
    let nx=uy, ny=-ux; if(nx<0){nx=-nx;ny=-ny;}
    const at=t=>({x:P.x+t*ax,y:P.y+t*ay}), c1=at(0.30), c2=at(0.72);
    const af=[{x:c1.x+1.0*nx,y:c1.y+1.0*ny},{x:c2.x+0.7*nx,y:c2.y+0.7*ny}];
    const ab=[{x:af[0].x-0.5*nx,y:af[0].y-0.5*ny},{x:af[1].x-0.5*nx,y:af[1].y-0.5*ny}];
    const armF=skArc(P,af[0],af[1],F,240).len, armB=skArc(P,ab[0],ab[1],F,240).len;
    const neckF=skArc(M,fn[0],fn[1],K,240).len, neckB=skArc(M,bn[0],bn[1],N,240).len;
    const neckTotal=2*(neckF+neckB);
    return {SW,nw,A,B,C,D,E,F,M,K,Lp,N,P,Q,fn,bn,af,ab,armF,armB,neckF,neckB,neckTotal};
  }
  /* sleeve: cap height C/12, width W solved so the caps match the armholes */
  function tsSleeveAt(W,h,SL){
    const A={x:W,y:0}, Bc={x:0,y:0}, C={x:W,y:SL}, D={x:0,y:h}, E={x:1,y:SL};
    const dvx=D.x-A.x, dvy=D.y-A.y, dl=Math.hypot(dvx,dvy)||1, nx=-dvy/dl, ny=dvx/dl;
    const along=t=>({x:A.x+t*dvx,y:A.y+t*dvy}); const F=along(.25),G=along(.5),H=along(.75);
    const I={x:F.x+.5*nx,y:F.y+.5*ny}, J={x:H.x-.4*nx,y:H.y-.4*ny}, Jb={x:J.x-0.2*nx,y:J.y-0.2*ny};
    const front=[A,I,G,J,D], back=[A,F,G,Jb,D];
    return {W,A,B:Bc,C,D,E,F,G,H,I,J,Jb,front,back,capF:crLen(front),capB:crLen(back)};
  }
  function tsSleeve(m){
    const g=tsGeom(m), h=m.C/12, target=g.armF+g.armB;
    let lo=0.5, hi=m.C/2;
    for(let i=0;i<60;i++){ const mid=(lo+hi)/2, s=tsSleeveAt(mid,h,m.SL);
      if(s.capF+s.capB<target) lo=mid; else hi=mid; }
    const s=tsSleeveAt((lo+hi)/2,h,m.SL);
    return {...s, h, armF:g.armF, armB:g.armB,
            resF:s.capF/g.armF-1, resB:s.capB/g.armB-1, resT:(s.capF+s.capB)/target-1};
  }

  /* ── Part 1 · Front (6 steps) — on the fold ── */
  const TS_FRONT = {
    name:'Part 1 · T-shirt front', scale:15, pad:36, mr:70, mb:20, foldDx:60,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',M:'M',K:'K',Lp:'L',P:'P',Q:'Q'},
    labs:{A:'r',B:'r',C:'l',D:'u',E:'r',F:'l',M:'u',K:'r',Lp:'dl',P:'l',Q:'l'},
    small:{Lp:1,Q:1},
    sheet:(m)=>({W:m.C/4+1.5, H:m.L}),
    points:(m)=>{ const g=tsGeom(m); return {
      A:{...g.A,s:1,gov:'on fold',note:'fold·top'}, B:{...g.B,s:1,gov:'L',note:'fold·hem'},
      D:{...g.D,s:2,gov:'S/2',note:'tira'}, E:{...g.E,s:2,gov:'C/4',note:'chest·fold'},
      F:{...g.F,s:2,gov:'C/4+1.5',note:'chest·side'},
      M:{...g.M,s:3,gov:'C/12+0.5',note:'neck width'}, K:{...g.K,s:3,gov:'C/12+0.5',note:'neck depth'},
      Lp:{...g.Lp,s:3,gov:'box',note:''},
      P:{...g.P,s:4,gov:'D↓1″',note:'shoulder tip'}, Q:{...g.Q,s:5,gov:'ref',note:''},
      C:{...g.C,s:6,gov:'F↓hem',note:'side·hem'}, _g:g,
    };},
    edges:(pt)=>{ const g=pt._g, L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      const cub=(a,c,b)=>`M ${f2(a.x)} ${f2(a.y)} C ${f2(c[0].x)} ${f2(c[0].y)} ${f2(c[1].x)} ${f2(c[1].y)} ${f2(b.x)} ${f2(b.y)}`;
      return [
        {id:'ts_fold',s:1,color:'var(--purple)',from:'A',to:'B',d:L(g.A,g.B),gov:'on fold'},
        {id:'ts_top',s:2,color:'var(--text3)',from:'D',to:'A',dash:true,d:L(g.D,g.A),gov:'S/2'},
        {id:'ts_chest',s:2,color:'var(--accent)',from:'F',to:'E',d:L(g.F,g.E),gov:'C/4+1.5'},
        {id:'ts_box1',s:3,color:'var(--text3)',from:'M',to:'Lp',dash:true,d:L(g.M,g.Lp),gov:'box'},
        {id:'ts_box2',s:3,color:'var(--text3)',from:'Lp',to:'K',dash:true,d:L(g.Lp,g.K),gov:'box'},
        {id:'ts_fneck',s:3,color:'var(--red)',from:'M',to:'K',man:true,d:cub(g.M,g.fn,g.K),gov:'french · crew M→K'},
        {id:'ts_shoulder',s:4,color:'var(--accent)',from:'M',to:'P',d:L(g.M,g.P),gov:'M→P · 1″ drop'},
        {id:'ts_dq',s:5,color:'var(--text3)',from:'D',to:'Q',dash:true,d:L(g.D,g.Q),gov:'split ref'},
        {id:'ts_farm',s:5,color:'var(--red)',from:'P',to:'F',man:true,d:cub(g.P,g.af,g.F),gov:'front armhole'},
        {id:'ts_barm',s:5,color:'var(--blue)',from:'P',to:'F',man:true,d:cub(g.P,g.ab,g.F),gov:'back armhole · 0.5″'},
        {id:'ts_side',s:6,color:'var(--red)',from:'F',to:'C',d:L(g.F,g.C),gov:'straight side seam'},
        {id:'ts_hem',s:6,color:'var(--green)',from:'C',to:'B',d:L(g.C,g.B),gov:'hem'},
      ];},
    steps:[
      {n:1,en:'Fold the sheet',deps:[],formula:'sheet L × (C/4+1.5) on the fold'},
      {n:2,en:'Tira & chest line',deps:['A'],formula:'D = S/2 · E = C/4 · E→F = C/4+1.5'},
      {n:3,en:'Crew neck',deps:['A'],formula:'M = K = C/12+0.5 · french M→K',man:true},
      {n:4,en:'Shoulder slope',deps:['D','M'],formula:'P = D↓1″ · join M→P'},
      {n:5,en:'Armhole',deps:['P','F'],formula:'french P→F · front/back 0.5″ split',man:true},
      {n:6,en:'Side seam & hem',deps:['F'],formula:'F→C straight · C→B hem'},
    ],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ const g=pt._g, foldX=sx(SW); let s='';
      if(cur===1){ s+=dimV(foldX+30,sy(0),sy(SH),`L = ${fmt(m.L)}″`); s+=dimH(sx(0),sx(SW),sy(SH)+18,`C/4+1.5 = ${fmt(SW)}″`); }
      if(cur===2){ s+=dimH(sx(g.D.x),sx(SW),sy(0)-16,`S/2 = ${fmt(m.S/2)}″`);
        s+=dimV(foldX+16,sy(0),sy(g.E.y),`C/4 = ${fmt(m.C/4)}″`); }
      if(cur===3){ s+=dimV(foldX+16,sy(0),sy(g.K.y),`C/12+0.5 = ${fmt(g.nw)}″`);
        s+=dimH(sx(g.M.x),sx(SW),sy(0)-16,`C/12+0.5`); }
      if(cur===4) s+=dimV(sx(g.D.x)-16,sy(0),sy(g.P.y),`1″`);
      if(cur===5) s+=`<text class="dimtxt" x="${sx(SW*0.45)}" y="${sy(g.F.y)+22}" text-anchor="middle" fill="var(--text2)">front ${fmt(g.armF)}″ · back ${fmt(g.armB)}″</text>`;
      if(cur===6) s+=dimV(sx(0)-16,sy(g.F.y),sy(SH),`straight · ${fmt(SH-g.F.y)}″`);
      return s; },
  };

  /* ── Part 2 · Back (2 steps) — traced from the front, own neck ── */
  const TS_BACK = {
    name:'Part 2 · T-shirt back', cross:'traced from Part 1', scale:15, pad:36, mr:70, mb:20, foldDx:60,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',M:'M',N:'N',P:'P'},
    labs:{A:'ur',B:'r',C:'l',D:'u',E:'r',F:'l',M:'u',N:'dr',P:'l'}, small:{},
    sheet:(m)=>({W:m.C/4+1.5, H:m.L}),
    points:(m)=>{ const g=tsGeom(m); return {
      A:{...g.A,s:1,gov:'on fold',note:'fold·top'}, B:{...g.B,s:1,gov:'L',note:'fold·hem'},
      C:{...g.C,s:1,gov:'traced',note:'side·hem'}, D:{...g.D,s:1,gov:'S/2',note:'tira'},
      E:{...g.E,s:1,gov:'C/4',note:'chest·fold'}, F:{...g.F,s:1,gov:'traced',note:'chest·side'},
      M:{...g.M,s:1,gov:'C/12+0.5',note:'neck width'}, P:{...g.P,s:1,gov:'D↓1″',note:'shoulder tip'},
      N:{...g.N,s:2,gov:'A↓0.75″',note:'back neck'}, _g:g,
    };},
    edges:(pt)=>{ const g=pt._g, L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      const cub=(a,c,b)=>`M ${f2(a.x)} ${f2(a.y)} C ${f2(c[0].x)} ${f2(c[0].y)} ${f2(c[1].x)} ${f2(c[1].y)} ${f2(b.x)} ${f2(b.y)}`;
      return [
        {id:'tb_fold',s:1,color:'var(--purple)',from:'A',to:'B',d:L(g.A,g.B),gov:'on fold'},
        {id:'tb_chest',s:1,color:'var(--accent)',from:'F',to:'E',d:L(g.F,g.E),gov:'C/4+1.5'},
        {id:'tb_shoulder',s:1,color:'var(--accent)',from:'M',to:'P',d:L(g.M,g.P),gov:'traced · 1″ drop'},
        {id:'tb_arm',s:1,color:'var(--blue)',from:'P',to:'F',man:true,d:cub(g.P,g.ab,g.F),gov:'traced back armhole'},
        {id:'tb_side',s:1,color:'var(--red)',from:'F',to:'C',d:L(g.F,g.C),gov:'traced side seam'},
        {id:'tb_hem',s:1,color:'var(--green)',from:'C',to:'B',d:L(g.C,g.B),gov:'hem'},
        {id:'tb_neck',s:2,color:'var(--blue)',from:'M',to:'N',man:true,d:cub(g.M,g.bn,g.N),gov:'french · back M→N'},
      ];},
    steps:[
      {n:1,en:'Frame & traced lines',deps:[],formula:'trace Part 1 · shoulder · back armhole · side · hem',man:true},
      {n:2,en:'Back neck',deps:['A','M'],formula:'N = A↓0.75″ · french M→N',man:true},
    ],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ const g=pt._g, foldX=sx(SW); let s='';
      if(cur===1) s+=dimV(foldX+30,sy(0),sy(SH),`L = ${fmt(m.L)}″`);
      return s; },
  };

  /* ── Part 3 · Sleeve (4 steps) — width solved against the armhole ── */
  const TS_SLEEVE = {
    name:'Part 3 · Sleeve', cross:'needs Part 1 armhole', scale:20, pad:36, mr:62, mb:30, foldDx:52,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G',H:'H',I:'I',J:'J'},
    labs:{A:'r',B:'l',C:'r',D:'l',E:'dl',F:'dr',G:'u',H:'ul',I:'u',J:'dl'},
    small:{F:1,G:1,H:1,I:1,J:1},
    sheet:(m)=>({W:tsSleeve(m).W, H:m.SL}),
    points:(m)=>{ const s=tsSleeve(m); return {
      A:{...s.A,s:2,gov:'on fold',note:'cap peak'}, B:{...s.B,s:2,gov:'W solved',note:'top outer'},
      C:{...s.C,s:2,gov:'SL',note:'hem·fold'}, D:{...s.D,s:3,gov:'C/12',note:'underarm'},
      E:{...s.E,s:3,gov:'W−1',note:'hem outer'},
      F:{...s.F,s:4,gov:'¼ A–D',note:''}, G:{...s.G,s:4,gov:'½ A–D',note:'curve thru'}, H:{...s.H,s:4,gov:'¾ A–D',note:''},
      I:{...s.I,s:4,gov:'+0.5″',note:'bulge'}, J:{...s.J,s:4,gov:'−0.4″',note:'scoop'}, _s:s,
    };},
    edges:(pt)=>{ const s=pt._s, L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      return [
        {id:'tsl_top',s:2,color:'var(--text3)',from:'B',to:'A',dash:true,d:L(s.B,s.A),gov:'W (solved)'},
        {id:'tsl_fold',s:2,color:'var(--purple)',from:'A',to:'C',d:L(s.A,s.C),gov:'SL · on fold'},
        {id:'tsl_left',s:3,color:'var(--text3)',from:'B',to:'D',dash:true,d:L(s.B,s.D),gov:'C/12'},
        {id:'tsl_under',s:3,color:'var(--red)',from:'D',to:'E',d:L(s.D,s.E),gov:'underarm D→E'},
        {id:'tsl_hem',s:3,color:'var(--green)',from:'E',to:'C',d:L(s.E,s.C),gov:'hem W−1'},
        {id:'tsl_chord',s:4,color:'var(--text3)',from:'A',to:'D',dash:true,d:L(s.A,s.D),gov:'quarter ref'},
        {id:'tsl_fcap',s:4,color:'var(--accent)',from:'A',to:'D',man:true,d:crPath(s.front),gov:'front cap A·I·G·J·D'},
        {id:'tsl_bcap',s:4,color:'var(--blue)',from:'A',to:'D',man:true,d:crPath(s.back),gov:'back cap · 0.2″ deeper'},
      ];},
    steps:[
      {n:1,en:'Fold the sheet',deps:[],formula:'sheet SL × 2W · W solved so cap = armhole'},
      {n:2,en:'Length & width',deps:['sheet'],formula:'A→C = SL · A→B = W (solved)'},
      {n:3,en:'Cap height & hem',deps:['B','C'],formula:'D = C/12 · E = W−1 (1″ taper)'},
      {n:4,en:'Cap (solved)',deps:['A','D'],formula:'¼ A–D · I +0.5″ · J −0.4″ · cap length = armhole length',man:true},
    ],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ const s=pt._s; let g='';
      if(cur===1) g+=`<text class="dimtxt" x="${sx(SW/2)}" y="${sy(SH/2)}" text-anchor="middle" fill="var(--purple)">fold ${fmt(2*s.W)}″ → ${fmt(s.W)}″ × ${fmt(m.SL)}″</text>`;
      if(cur>=2){ g+=dimH(sx(0),sx(SW),sy(0)-16,`W = ${fmt(s.W)}″ (solved)`); g+=dimV(sx(SW)+16,sy(0),sy(SH),`SL = ${fmt(m.SL)}″`); }
      if(cur===3){ g+=dimV(sx(0)-16,sy(0),sy(s.D.y),`C/12 = ${fmt(s.h)}″`); g+=dimH(sx(s.E.x),sx(SW),sy(SH)+18,`W−1 = ${fmt(s.W-1)}″`); }
      if(cur===4){ g+=`<text class="dimtxt" x="${sx(SW*0.6)}" y="${sy(SH*0.62)}" fill="var(--accent2)" text-anchor="middle">cap ${fmt(s.capF+s.capB)}″ = armhole ${fmt(s.armF+s.armB)}″</text>`;
        g+=`<text class="dimtxt" x="${sx(SW*0.6)}" y="${sy(SH*0.62)+13}" fill="var(--text2)" text-anchor="middle">front ${(s.resF*100).toFixed(1)}% · back ${(s.resB*100).toFixed(1)}%</text>`; }
      return g; },
  };

  /* ── Part 4 · Neckband (1 step) — rib, 0.85 × neckline ── */
  const TS_BAND = {
    name:'Part 4 · Neckband', cross:'needs Parts 1–2 neckline', fold:false, scale:14, pad:38, mr:40, mb:30, foldDx:0,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F'},
    labs:{A:'ur',B:'dr',C:'ul',D:'dl',E:'r',F:'l'}, small:{E:1,F:1},
    sheet:(m)=>({W:TS_RIB*tsGeom(m).neckTotal, H:2}),
    points:(m)=>{ const W=TS_RIB*tsGeom(m).neckTotal; return {
      A:{x:W,y:0,s:1,gov:'0.85 × neck',note:'band·end'}, B:{x:W,y:2,s:1,gov:'2″',note:''},
      C:{x:0,y:0,s:1,gov:'origin',note:'band·end'}, D:{x:0,y:2,s:1,gov:'2″',note:''},
      E:{x:W,y:1,s:1,gov:'mid',note:'fold'}, F:{x:0,y:1,s:1,gov:'mid',note:'fold'},
    };},
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      return [
        {id:'nb_top',s:1,color:'var(--accent)',from:'C',to:'A',d:L(pt.C,pt.A),gov:'0.85 × neckline'},
        {id:'nb_bot',s:1,color:'var(--green)',from:'D',to:'B',d:L(pt.D,pt.B),gov:'0.85 × neckline'},
        {id:'nb_r',s:1,color:'var(--red)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'2″'},
        {id:'nb_l',s:1,color:'var(--red)',from:'C',to:'D',d:L(pt.C,pt.D),gov:'2″'},
        {id:'nb_fold',s:1,color:'var(--purple)',from:'F',to:'E',dash:true,d:L(pt.F,pt.E),gov:'fold line'},
      ];},
    steps:[{n:1,en:'Rib neckband',deps:['M','K','N'],formula:'length = 0.85 × 2(front+back neck) · width 2″, fold to 1″'}],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ const g=tsGeom(m); let s='';
      s+=dimH(sx(0),sx(SW),sy(0)-18,`0.85 × ${fmt(g.neckTotal)}″ = ${fmt(SW)}″`);
      s+=dimV(sx(SW)+20,sy(0),sy(SH),`2″`);
      return s; },
  };

  /* ── t-shirt instructions ── */
  const INSTR_TS_FRONT = {
    1:{draft:(v,m)=>[
        `Take a sheet ${fmt(m.L)}″ long and ${fmt((m.C/4+1.5)*2)}″ wide and fold it in half lengthwise → ${fmt(m.L)}″ × ${fmt(m.C/4+1.5)}″. The fold is the centre front.`,
        `Mark A at the top on the fold and B ${fmt(m.L)}″ below it — the hem on the centre front.`],
       sew:()=>"Cut the front on the fold of the knit, with the fold running along a single rib (wale) so the shirt does not twist after washing.",
       tip:(v,m)=>`The width C/4+1.5 = ${fmt(m.C/4+1.5)}″ gives 6″ of ease round the chest — a relaxed unisex fit. Use C/4+1 for a slimmer tee.`},
    2:{draft:(v,m)=>[
        `From A measure ${fmt(m.S/2)}″ (S/2) along the top and mark D — the tira (shoulder point).`,
        `From A measure ${fmt(m.C/4)}″ (C/4) down the fold and mark E — the armhole depth, the same as the shirt's chest point.`,
        `From E rule ${fmt(m.C/4+1.5)}″ (C/4+1.5) toward the open edge and mark F. F lands on the open edge: a unisex tee has no waist shaping.`],
       sew:null,
       tip:()=>"The chest line is a construction line only; nothing is stitched along it."},
    3:{draft:(v,m)=>[
        `From A measure ${fmt(m.C/12+0.5)}″ (C/12+0.5) along the top and mark M — the neck width, the blouse's neck-width formula.`,
        `From A measure the same ${fmt(m.C/12+0.5)}″ down the fold and mark K — the front neck depth. Equal width and depth is what makes it a round crew neck.`,
        `Close the box M–L–K and draw the neck with a French curve from M to K: it leaves M straight down and meets K flat.`],
       sew:()=>"The neck edge is finished with the rib band from Part 4, so draft the curve smooth — any wobble shows through the band.",
       tip:()=>"For a scoop neck lower K by 1–2″ and leave M where it is."},
    4:{draft:()=>[
        "From D measure 1″ straight down and mark P — the shoulder tip.",
        "Join M to P — the shoulder seam, the same flat 1″ drop as the shirt."],
       sew:()=>"Join front and back shoulders M–P with a stretch stitch or overlock, and tape the seam with clear elastic or a strip of selvedge so it does not grow.",
       tip:()=>"Knit shoulders stretch under the weight of the sleeves; the tape is what keeps the tee's shoulder line where you drafted it."},
    5:{draft:(v,m)=>[
        "Drop a line from D to the chest line and mark Q — the armhole split reference.",
        "With a French curve draw the armhole from P to F. Draw it twice, 0.5″ apart: the fuller scoop is the front armhole, the shallower one the back — the kurta's own construction.",
        "Measure both curves along their length. The sleeve in Part 3 is solved against exactly these two numbers."],
       sew:()=>"Set the sleeve in flat: stitch the sleeve cap into the open armhole before closing the side seams.",
       tip:()=>"Notch the shoulder tip and the underarm now; they are the two points you match when setting the sleeve."},
    6:{draft:(v,m)=>[
        `From F rule straight down the open edge to the hem and mark C. F→C is the side seam — dead straight, the boxy unisex cut.`,
        `Join C to B — the hem.`],
       sew:()=>"Close the side seam and the sleeve underarm in one line from the sleeve hem to the body hem. Turn the hem up 1″ and twin-needle or coverstitch it.",
       tip:()=>"Add 1″ below B–C for the hem turn-up when you cut; the draft line is the finished hem."},
  };
  const INSTR_TS_BACK = {
    1:{draft:(v,m)=>[
        `Fold a sheet the same size as the front, ${fmt(m.L)}″ × ${fmt(m.C/4+1.5)}″, the fold being the centre back.`,
        "Trace everything from Part 1 except the neck: the tira D, the shoulder M→P, the back armhole (the shallower of the two curves), the chest line, the side seam F→C and the hem."],
       sew:()=>"Cut the back on the fold. Front and back are the same piece apart from the neck, so the side seams match exactly.",
       tip:()=>"Use the back (shallower) armhole curve here, not the front one."},
    2:{draft:()=>[
        "From A measure 0.75″ down the fold and mark N — the back neck depth, much shallower than the front.",
        "With a French curve join M to N — the back neckline."],
       sew:()=>"The back neck takes the seam of the rib band; start and finish the band at a shoulder seam or the centre back.",
       tip:()=>"0.75″ keeps the back neck high, so the tee sits forward on the body instead of sliding back."},
  };
  const INSTR_TS_SLEEVE = {
    1:{draft:(v,m)=>{ const s=tsSleeve(m); return [
        `Take a sheet ${fmt(m.SL)}″ long and ${fmt(2*s.W)}″ wide and fold it → ${fmt(m.SL)}″ × ${fmt(s.W)}″. The fold is the sleeve centre.`,
        `The width ${fmt(s.W)}″ is not a fixed formula: it is solved so the finished cap is exactly as long as the armhole you drafted in Part 1. Change the chest or shoulder and it re-solves.`]; },
       sew:()=>"Cut 2 on the fold, mirrored.",
       tip:()=>"Knit needs no cap ease: the cap and the armhole are made equal, so the sleeve sets in flat without gathering."},
    2:{draft:(v,m)=>{ const s=tsSleeve(m); return [
        "Mark A at the top on the fold — the cap peak.",
        `From A measure ${fmt(m.SL)}″ (SL) down the fold and mark C.`,
        `From A measure ${fmt(s.W)}″ (W) toward the open edge and mark B.`]; },
       sew:null,
       tip:()=>"A longer SL makes a half sleeve; the cap and the solved width do not change."},
    3:{draft:(v,m)=>{ const s=tsSleeve(m); return [
        `From B measure ${fmt(m.C/12)}″ (C/12) down and mark D — the cap height and underarm point, the same as the kurta sleeve.`,
        `From C measure ${fmt(s.W-1)}″ (W−1) toward the open edge and mark E — the sleeve hem, 1″ narrower than the bicep on each half.`,
        "Join D–E — the underarm seam."]; },
       sew:()=>"The underarm seam D–E is closed in the same pass as the side seam.",
       tip:()=>"A short cap (C/12) is what gives a tee its relaxed, dropped look compared to a fitted shirt sleeve."},
    4:{draft:(v,m)=>{ const s=tsSleeve(m); return [
        "Rule A–D and divide it into quarters. Push the curve out +0.5″ at the upper quarter (I) and in −0.4″ at the lower quarter (J) — the corpus quarter-division cap.",
        "Draw the front cap A·I·G·J·D, and the back cap A·F·G·J·D held 0.2″ deeper at J.",
        `Check: front cap + back cap = ${fmt(s.capF+s.capB)}″, front armhole + back armhole = ${fmt(s.armF+s.armB)}″. They agree because W was solved for it; individually the front differs by ${(s.resF*100).toFixed(1)}% and the back by ${(s.resB*100).toFixed(1)}%.`]; },
       sew:()=>"Match the cap peak A to the shoulder seam and D to the side seam, stretch the knit very slightly if needed, and stitch the cap into the armhole flat.",
       tip:()=>"If one side is more than about 3% off, move the sleeve's centre notch toward the longer side rather than easing."},
  };
  const INSTR_TS_BAND = {
    1:{draft:(v,m)=>{ const g=tsGeom(m), W=TS_RIB*g.neckTotal; return [
        `Measure the drafted neckline: front curve ${fmt(g.neckF)}″ and back curve ${fmt(g.neckB)}″ on each half, so the full neckline is 2 × (${fmt(g.neckF)} + ${fmt(g.neckB)}) = ${fmt(g.neckTotal)}″.`,
        `Cut a strip of rib 0.85 × ${fmt(g.neckTotal)}″ = ${fmt(W)}″ long and 2″ wide, with the stretch running along its length.`,
        "Mark the fold line E–F halfway across; the band finishes 1″ deep."]; },
       sew:()=>"Join the short ends into a ring, fold it along E–F, quarter-mark the ring and the neckline, and stitch with the band stretched evenly to the neckline.",
       tip:()=>"0.85 suits a 1×1 rib; for a less stretchy self-fabric band use about 0.9."},
  };
  TS_FRONT.instr=INSTR_TS_FRONT; TS_BACK.instr=INSTR_TS_BACK; TS_SLEEVE.instr=INSTR_TS_SLEEVE; TS_BAND.instr=INSTR_TS_BAND;

  /* ═══ FINISHED-T-SHIRT PREVIEW — body from tsGeom, sleeve from the solved
     W laid flat (opening W−1), set into the armhole chord P→F.          ═══ */
  function tshirtGarment(m){
    const g=tsGeom(m), s=tsSleeve(m), SW=g.SW, X=p=>({x:SW-p.x,y:p.y});   // draft → centre-out
    const HR=X(g.M), G0=X(g.K), Mp=X(g.P), F=X(g.F), Hc={x:SW,y:m.L}, L=m.L;
    // sleeve laid flat as a cone on the armhole chord, drooped like the blouse preview
    const aL=Math.hypot(F.x-Mp.x,F.y-Mp.y)||1, dxn=(F.x-Mp.x)/aL, dyn=(F.y-Mp.y)/aL;
    const DR=35*Math.PI/180, cs=Math.cos(DR), sn=Math.sin(DR);
    const ax={x:dyn*cs+dxn*sn, y:dyn*sn-dxn*cs}, cw={x:-ax.y, y:ax.x};
    const ulen=Math.hypot(s.E.x-s.D.x,s.E.y-s.D.y), open=s.W-1;
    const capO={x:Mp.x+ax.x*m.SL, y:Mp.y+ax.y*m.SL};
    const slO={x:capO.x+cw.x*open, y:capO.y+cw.y*open};
    const F2={x:slO.x-ax.x*ulen, y:slO.y-ax.y*ulen};          // underarm end on the body
    const R=[
      {c:lin(HR,Mp),end:Mp}, {c:lin(Mp,capO),end:capO}, {c:lin(capO,slO),end:slO},
      {c:lin(slO,F2),end:F2}, {c:lin(F2,F),end:F}, {c:lin(F,Hc),end:Hc}, {c:lin(Hc,{x:0,y:L}),end:{x:0,y:L}},
    ];
    const HL={x:-HR.x,y:0};
    const fnR=[{x:HR.x,y:g.fn[0].y},{x:SW-g.fn[1].x,y:g.fn[1].y}];
    let segs=[['M',HL],['C',{x:-fnR[0].x,y:fnR[0].y},{x:-fnR[1].x,y:fnR[1].y},G0],['C',fnR[1],fnR[0],HR]];
    R.forEach(r=>segs.push(['C',r.c[0],r.c[1],r.end]));
    for(let i=R.length-1;i>=0;i--){ const r=R[i], start=i===0?HR:R[i-1].end;
      segs.push(['C',{x:-r.c[1].x,y:r.c[1].y},{x:-r.c[0].x,y:r.c[0].y},{x:-start.x,y:start.y}]); }
    segs.push(['Z']);
    const pts=[]; segs.forEach(q=>{ for(let i=1;i<q.length;i++) pts.push(q[i]); });
    const xs=pts.map(p=>p.x), ys=pts.map(p=>p.y);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const TW=134, TH=170, k=Math.min(TW/(maxX-minX), TH/(maxY-minY));
    const ox=70-((minX+maxX)/2)*k, oy=97-((minY+maxY)/2)*k;
    const T=p=>({x:p.x*k+ox, y:p.y*k+oy});
    const base=segs.map(q=> q[0]==='M'?`M ${fmt2(T(q[1]))}`: q[0]==='Z'?'Z'
      : `C ${fmt2(T(q[1]))} ${fmt2(T(q[2]))} ${fmt2(T(q[3]))}`).join(' ');
    const seg=(a,b)=>`M ${fmt2(T(a))} L ${fmt2(T(b))}`;
    const cub=(a,c1,c2,e)=>`M ${fmt2(T(a))} C ${fmt2(T(c1))} ${fmt2(T(c2))} ${fmt2(T(e))}`;
    const mir=p=>({x:-p.x,y:p.y});
    const segM=(a,b)=>seg(a,b)+' '+seg(mir(a),mir(b));
    const pair=(a,c1,c2,e)=>cub(a,c1,c2,e)+' '+cub(mir(a),mir(c1),mir(c2),mir(e));
    const arm=[X(g.af[0]),X(g.af[1])];
    const neck=`M ${fmt2(T(HL))} C ${fmt2(T({x:-fnR[0].x,y:fnR[0].y}))} ${fmt2(T({x:-fnR[1].x,y:fnR[1].y}))} ${fmt2(T(G0))} C ${fmt2(T(fnR[1]))} ${fmt2(T(fnR[0]))} ${fmt2(T(HR))}`;
    const N0=X(g.N), bnR=[{x:HR.x,y:g.bn[0].y},{x:SW-g.bn[1].x,y:g.bn[1].y}];
    const backneck=`M ${fmt2(T(HL))} C ${fmt2(T({x:-bnR[0].x,y:bnR[0].y}))} ${fmt2(T({x:-bnR[1].x,y:bnR[1].y}))} ${fmt2(T(N0))} C ${fmt2(T(bnR[1]))} ${fmt2(T(bnR[0]))} ${fmt2(T(HR))}`;
    const plain=pair(Mp,arm[0],arm[1],F);
    const hl={
      length: seg({x:0,y:G0.y},{x:0,y:L}),
      shoulder: segM(HR,Mp), chest: seg({x:-F.x,y:F.y},{x:F.x,y:F.y}),
      neckline: neck, backneck, band: neck,
      armhole: pair(Mp,arm[0],arm[1],F),
      side: segM(F,Hc), hem: seg({x:-Hc.x,y:L},{x:Hc.x,y:L}),
      sleeve: segM(Mp,capO)+' '+segM(capO,slO)+' '+segM(slO,F2),
      slhem: segM(capO,slO), underarm: segM(slO,F2),
    };
    return {base,hl,plain,fold:{y1:T({x:0,y:0}).y, y2:T({x:0,y:L}).y}};
  }



  /* ── t-shirt PARTS entry — 4 phases, 13 steps ── */
  PARTS.tshirt = {
    label:'Unisex T-shirt', tag:"unisex tee \u00b7 front(1-6) \u00b7 back(1-2) \u00b7 sleeve(1-4, solved) \u00b7 neckband(1) \u00b7 textbook draft, not USHA",
    chart:'tshirt',
    uses:['C','S','L','SL'],
    fieldLabels:{C:'Chest (C)',SL:'Sleeve len (SL)'},
    phases:[TS_FRONT, TS_BACK, TS_SLEEVE, TS_BAND],
    garmentTitle:'Finished t-shirt \u2014 this step',
    garment:{ gen:tshirtGarment, HL:{
      1:{ids:['length'],cap:'Front drafted on the fold \u2014 the centre line is the length L.'},
      2:{ids:['shoulder','chest'],cap:'Tira (S/2) and the chest line C/4+1.5 at depth C/4 \u2014 straight to the side, no waist.'},
      3:{ids:['neckline'],cap:'Crew neck \u2014 width and depth both C/12+0.5.'},
      4:{ids:['shoulder'],cap:'Shoulder seam M\u2192P, a flat 1\u2033 drop.'},
      5:{ids:['armhole'],cap:'Armhole P\u2192F, front and back curves 0.5\u2033 apart; their lengths drive the sleeve.'},
      6:{ids:['side','hem'],cap:'Straight side seam and hem \u2014 the boxy unisex cut.'},
      7:{ids:['shoulder','armhole','side'],cap:'Back traced from the front: shoulder, back armhole, side seam and hem.'},
      8:{ids:['backneck'],cap:'Back neck, only 0.75\u2033 deep (dashed: the far face of the tee).'},
      9:{ids:['sleeve'],cap:'Sleeve on the fold \u2014 its width is solved, not ruled.'},
      10:{ids:['sleeve'],cap:'Sleeve length SL and the solved width W.'},
      11:{ids:['slhem','underarm'],cap:'Cap height C/12, hem W\u22121 and the underarm seam.'},
      12:{ids:['armhole','sleeve'],cap:'Cap drawn by the quarter method; its length equals the armhole, so it sets in flat.'},
      13:{ids:['band'],cap:'Rib neckband, 0.85 \u00d7 the drafted neckline, stretched on to sit flat.'},
    }},
  };


  const ECO = PARTS.tshirt;
  ECO.id = 'tshirt';
  ECO.chartSizes = TSHIRT_CHART;
  return ECO;
});
