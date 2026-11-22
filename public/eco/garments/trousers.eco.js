/* SILAI Executable Craft Object
   id      : trousers
   kind    : garment
   deps    : kit, geometry
   source  : USHA Silai School tailoring manual (Zarapkar drafting system) - Chapter 19 (trousers)
   This file is served from the SILAI object store (eco/manifest.json). The studio
   fetches it, checks its SHA-256 against the manifest, then runs the factory below.
   The drafting code inside is unchanged from the single-file studio. */
SILAI.define('trousers', ["kit", "geometry"], function (kit, geo) {
  const { fmt, V, dimH, dimV, crPath } = kit;
  const { bezAt, maxLean, fmt2, KAPPA, f2, qCtrl, qCurve, vCurve, lin, skUnit, skArc, skAtLen } = geo;
  const PARTS = {};   // this object's descriptor is written as PARTS.<id> below

  /* ═══════════════════ TROUSERS (USHA Chapter 19) ══════════════════════
     नाप तालिका → FL, H, W, BL, B, PL.  Six parts:
       1 front · 2 back · 3 first belt · 4 second belt · 5 fly · 6 pocket
     Every point below is a literal reading of the chapter's numbered steps;
     the only geometric modelling is the shape of the curves the manual names
     ("french curve", "hip curve", "leg shaper"), which are built as exact
     quarter-ellipses / Catmull-Rom splines rather than eyeballed arcs.
     ═══════════════════════════════════════════════════════════════════ */
  const TROUSER_CHART = {
    small:  {FL:38, H:32, W:30, BL:1.5, Bm:16, PL:13},
    medium: {FL:39, H:34, W:32, BL:1.5, Bm:18, PL:13},
    large:  {FL:40, H:36, W:34, BL:1.5, Bm:18, PL:13.5},
  };

  /* ── the front skeleton: shared by Part 1, Part 2 (traced across) and the
        finished-trouser preview, so all three can never drift apart ── */
  function trGeom(m){
    const SW=m.H/4+2, SH=m.FL-m.BL, hipY=m.H/3-1;          // 1.3 · 1.1 · 1.2
    const A={x:SW,y:0}, B={x:SW,y:SH}, C={x:SW,y:hipY}, D={x:0,y:hipY}, E={x:0,y:SH};
    const F={x:2,y:hipY}, G={x:2,y:0};                      // 2.1 · 2.2
    const K={x:2,y:0.5};                                    // 3.1
    const Lp={x:K.x+(m.W/4+0.5), y:K.y};                    // 3.3 · W/4+0.5
    const M={x:SW/2,y:hipY}, N={x:SW/2,y:SH};               // 4.1 · 4.2
    const O={x:SW,y:(hipY+SH)/2}, O1={x:SW,y:(hipY+SH)/2-2};// 5.1 · 5.2
    const P={x:O1.x-(m.H/4+2), y:O1.y};                     // 5.3 · H/4+2
    const Q={x:N.x-m.Bm/4,y:SH}, R={x:N.x+m.Bm/4,y:SH};     // 5.4 · B/4
    const kc=qCtrl(K,D);                                    // 3.2 french curve K→D
    return {SW,SH,hipY,A,B,C,D,E,F,G,K,Lp,M,N,O,O1,P,Q,R,kc};
  }

  /* ═══ PART 1 · TROUSER FRONT (5 steps) ═══════════════════════════════ */
  const TR_FRONT = {
    name:'Part 1 · Trouser front', cross:'', fold:false,
    scale:11, pad:34, mr:74, mb:20, foldDx:58,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G',K:'K',Lp:'L',M:'M',N:'N',O:'O',O1:'O1',P:'P',Q:'Q',R:'R'},
    labs:{A:'ur',B:'dr',C:'r',D:'l',E:'dl',F:'dr',G:'ul',K:'dl',Lp:'dl',M:'u',N:'dr',O:'r',O1:'r',P:'l',Q:'ul',R:'ur'},
    small:{F:1,G:1,O:1,O1:1,N:1},
    sheet:(m)=>({W:m.H/4+2, H:m.FL-m.BL}),
    points:(m)=>{ const g=trGeom(m); return {
      A:{...g.A,s:1,gov:'origin',note:'top·side'},
      B:{...g.B,s:1,gov:'FL−BL',note:'hem·side'},
      C:{...g.C,s:1,gov:'H/3−1',note:'hip point'},
      D:{...g.D,s:1,gov:'H/4+2',note:'fork tip'},
      E:{...g.E,s:1,gov:'D↓sheet',note:'hem·fork'},
      F:{...g.F,s:2,gov:'D→2″',note:'centre front'},
      G:{...g.G,s:2,gov:'F↑top',note:'seat top'},
      K:{...g.K,s:3,gov:'G↓0.5',note:'waist·CF'},
      Lp:{...g.Lp,s:3,gov:'W/4+0.5',note:'waist·side'},
      M:{...g.M,s:4,gov:'mid D–C',note:'crease top'},
      N:{...g.N,s:4,gov:'M↓hem',note:'crease hem'},
      O:{...g.O,s:5,gov:'mid C–B',note:''},
      O1:{...g.O1,s:5,gov:'O↑2″',note:'knee·side'},
      P:{...g.P,s:5,gov:'H/4+2',note:'knee·fork'},
      Q:{...g.Q,s:5,gov:'N←B/4',note:'mori·fork'},
      R:{...g.R,s:5,gov:'N→B/4',note:'mori·side'},
    };},
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      return [
      {id:'tr_len',s:1,color:'var(--text3)',from:'A',to:'B',dash:true,d:L(pt.A,pt.B),gov:'FL−BL'},
      {id:'tr_de',s:1,color:'var(--text3)',from:'D',to:'E',dash:true,d:L(pt.D,pt.E),gov:'D↓sheet'},
      {id:'tr_hip',s:1,color:'var(--accent)',from:'D',to:'C',d:L(pt.D,pt.C),gov:'H/4+2 · front hip line'},
      {id:'tr_seatmark',s:2,color:'var(--text3)',from:'D',to:'F',dash:true,d:L(pt.D,pt.F),gov:'2″ fork'},
      {id:'tr_seat',s:2,color:'var(--blue)',from:'G',to:'F',d:L(pt.G,pt.F),gov:'G→F seat length'},
      {id:'tr_waist',s:3,color:'var(--accent)',from:'K',to:'Lp',d:L(pt.K,pt.Lp),gov:'W/4+0.5 · front waist line'},
      {id:'tr_crotch',s:3,color:'var(--red)',from:'K',to:'D',man:true,d:qCurve(pt.K,pt.D),gov:'french · K→D'},
      {id:'tr_sideup',s:3,color:'var(--red)',from:'Lp',to:'C',man:true,d:vCurve(pt.Lp,pt.C),gov:'hip curve · L→C'},
      {id:'tr_crease',s:4,color:'var(--purple)',from:'M',to:'N',d:L(pt.M,pt.N),gov:'crease line · cut 2'},
      {id:'tr_kneemark',s:5,color:'var(--text3)',from:'O',to:'O1',dash:true,d:L(pt.O,pt.O1),gov:'2″'},
      {id:'tr_knee',s:5,color:'var(--accent)',from:'P',to:'O1',d:L(pt.P,pt.O1),gov:'H/4+2 · front knee'},
      {id:'tr_mori',s:5,color:'var(--green)',from:'Q',to:'R',d:L(pt.Q,pt.R),gov:'B/4 each side of N'},
      {id:'tr_inseam',s:5,color:'var(--red)',from:'D',to:'Q',d:L(pt.D,pt.P)+' '+L(pt.P,pt.Q),gov:'D→P→Q inseam'},
      {id:'tr_sidelow',s:5,color:'var(--red)',from:'C',to:'R',d:L(pt.C,pt.O1)+' '+L(pt.O1,pt.R),gov:'C→O1→R side seam'},
    ];},
    steps:[
      {n:1,en:'Length & hip line',deps:[],formula:'A→B = FL−BL · A→C = H/3−1 · C→D = H/4+2'},
      {n:2,en:'Seat length',deps:['D'],formula:'F = D→2″ · G = F↑ top'},
      {n:3,en:'Waist line & shape',deps:['G','C'],formula:'K = G↓0.5 · K→L = W/4+0.5 · french K→D · hip L→C',man:true},
      {n:4,en:'Crease line',deps:['D','C'],formula:'M = mid D–C · M→N ↓ hem'},
      {n:5,en:'Knee & mori width',deps:['M','C'],formula:'O1 = mid(C–B)↑2 · O1→P = H/4+2 · N ± B/4',man:true},
    ],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g=''; const rx=sx(SW);
      if(cur===1){ g+=dimV(rx+30,sy(0),sy(SH),`FL−BL = ${fmt(m.FL-m.BL)}″`);
        g+=dimV(rx+14,sy(0),sy(pt.C.y),`H/3−1 = ${fmt(m.H/3-1)}″`);
        g+=dimH(sx(pt.D.x),sx(pt.C.x),sy(pt.C.y)-8,`H/4+2 = ${fmt(m.H/4+2)}″`); }
      if(cur===2){ g+=dimH(sx(pt.D.x),sx(pt.F.x),sy(pt.D.y)+18,`2″`);
        g+=dimV(sx(pt.F.x)-16,sy(0),sy(pt.F.y),`seat = ${fmt(m.H/3-1)}″`); }
      if(cur===3) g+=dimH(sx(pt.K.x),sx(pt.Lp.x),sy(pt.K.y)-10,`W/4+0.5 = ${fmt(m.W/4+0.5)}″`);
      if(cur===4) g+=`<text class="dimtxt" x="${sx(pt.M.x)+6}" y="${sy((pt.M.y+pt.N.y)/2)}" fill="var(--purple)" transform="rotate(-90 ${sx(pt.M.x)+6} ${sy((pt.M.y+pt.N.y)/2)})" text-anchor="middle">crease line · cut 2</text>`;
      if(cur===5){ g+=dimH(sx(pt.P.x),sx(pt.O1.x),sy(pt.O1.y)-8,`H/4+2 = ${fmt(m.H/4+2)}″`);
        g+=dimH(sx(pt.Q.x),sx(pt.R.x),sy(SH)+34,`mori B/2 = ${fmt(m.Bm/2)}″ · B/4 each side of N`); }
      return g; },
  };

  /* ═══ PART 2 · TROUSER BACK (5 steps) ═════════════════════════════════
     Drafted straight over the front: the sheet is H/16 wider (all of it on the
     fork side) and BL longer (all of it above), so the whole of Part 1 is traced
     across first and the back lines are then measured off it.                */
  const TR_BACK = {
    name:'Part 2 · Trouser back', cross:'traced over Part 1', fold:false,
    scale:11, pad:34, mr:78, mb:20, foldDx:60,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G',K:'K',Lp:'L',M:'M',N:'N',O:'O',O1:'O1',P:'P',Q:'Q',R:'R',
             C1:'C1',D1:'D1',S:'S',P1:'P1',T:'T',U:'U',V:'V',Wp:'W',G1:'G1',A1:'A1',X:'X',Y:'Y',Z:'Z',Z1:'Z1'},
    labs:{A:'ur',B:'dr',C:'r',D:'u',E:'dl',F:'dr',G:'ul',K:'l',Lp:'d',M:'u',N:'dr',O:'r',O1:'r',P:'u',Q:'d',R:'dr',
          C1:'r',D1:'dr',S:'l',P1:'ul',T:'dl',U:'r',V:'ur',Wp:'ul',G1:'l',A1:'r',X:'u',Y:'r',Z:'u',Z1:'d'},
    small:{A:1,B:1,C:1,D:1,E:1,F:1,G:1,K:1,Lp:1,M:1,N:1,O:1,O1:1,P:1,Q:1,R:1,D1:1,G1:1,A1:1,V:1,Z:1},
    sheet:(m)=>({W:m.H/4+2+m.H/16, H:m.FL}),
    points:(m)=>{
      const g=trGeom(m), ox=m.H/16, oy=m.BL, t=(p)=>({x:p.x+ox,y:p.y+oy});
      const A=t(g.A),B=t(g.B),C=t(g.C),D=t(g.D),E=t(g.E),F=t(g.F),G=t(g.G),K=t(g.K),
            Lp=t(g.Lp),M=t(g.M),N=t(g.N),O=t(g.O),O1=t(g.O1),P=t(g.P),Q=t(g.Q),R=t(g.R);
      const C1={x:C.x,y:C.y+0.5};                                   // 1.1
      const D1={x:D.x,y:C1.y};                                      // 1.2
      const S={x:D1.x-m.H/16,y:C1.y};                               // 1.3 · H/16
      const P1={x:P.x-m.H/36,y:P.y}, T={x:Q.x-m.H/36,y:Q.y};        // 2.1 · 2.2 · H/36
      const U={x:M.x,y:M.y+m.H/12};                                 // 3.1 · H/12
      const kc=[t(g.kc[0]),t(g.kc[1])];
      const V=maxLean(K,kc[0],kc[1],D);                             // 3.2 · most-slanted pt of K–D
      const Wp={x:V.x-1.1,y:V.y};                                   // 3.3 · 1.1″
      const G1={x:F.x,y:(A.y+C.y)/2};                               // 3.5 · level with A1
      const A1={x:A.x,y:(A.y+C.y)/2};                               // 4.1 · mid A–C
      const X={x:K.x,y:K.y-1.5};                                    // 3.6 · 1.5″
      const dx=A.x-X.x, dy=A.y-X.y, dl=Math.hypot(dx,dy)||1, wb=m.W/4+1.5;
      const Y={x:X.x+wb*dx/dl, y:X.y+wb*dy/dl};                     // 4.3 · through A
      const Z={x:(X.x+Y.x)/2,y:(X.y+Y.y)/2};                        // 5.1
      const Z1={x:Z.x,y:Z.y+(m.H/6-1)};                             // 5.2 · H/6−1
      return {
        A:{...A,s:1,gov:'traced',note:''}, B:{...B,s:1,gov:'traced',note:''}, C:{...C,s:1,gov:'traced',note:''},
        D:{...D,s:1,gov:'traced',note:''}, E:{...E,s:1,gov:'traced',note:''}, F:{...F,s:1,gov:'traced',note:''},
        G:{...G,s:1,gov:'traced',note:''}, K:{...K,s:1,gov:'traced',note:''}, Lp:{...Lp,s:1,gov:'traced',note:''},
        M:{...M,s:1,gov:'traced',note:''}, N:{...N,s:1,gov:'traced',note:''}, O:{...O,s:1,gov:'traced',note:''},
        O1:{...O1,s:1,gov:'traced',note:''}, P:{...P,s:1,gov:'traced',note:''}, Q:{...Q,s:1,gov:'traced',note:''},
        R:{...R,s:1,gov:'traced',note:''},
        C1:{...C1,s:1,gov:'C↓0.5',note:'back hip·side'}, D1:{...D1,s:1,gov:'on D–E',note:''},
        S:{...S,s:1,gov:'H/16',note:'back fork'},
        P1:{...P1,s:2,gov:'P←H/36',note:'back knee'}, T:{...T,s:2,gov:'Q←H/36',note:'back mori'},
        U:{...U,s:3,gov:'M↓H/12',note:'back shape'}, V:{...V,s:3,gov:'lean K–D',note:''},
        Wp:{...Wp,s:3,gov:'V←1.1″',note:'seat lean'}, G1:{...G1,s:3,gov:'on G–F',note:''},
        X:{...X,s:3,gov:'K↑1.5',note:'back waist·CB'},
        A1:{...A1,s:4,gov:'mid A–C',note:''}, Y:{...Y,s:4,gov:'W/4+1.5',note:'back waist·side'},
        Z:{...Z,s:5,gov:'mid X–Y',note:''}, Z1:{...Z1,s:5,gov:'H/6−1',note:'dart tip'},
      };},
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      const legs=`M ${f2(pt.Z.x-0.5)} ${f2(pt.Z.y)} L ${f2(pt.Z1.x)} ${f2(pt.Z1.y)} `
                +`M ${f2(pt.Z.x+0.5)} ${f2(pt.Z.y)} L ${f2(pt.Z1.x)} ${f2(pt.Z1.y)}`;
      return [
      // ── Part 1, traced across (dim, drawn first) ──
      {id:'tb_hipF',s:1,color:'var(--text3)',from:'D',to:'C',d:L(pt.D,pt.C),gov:'traced · H/4+2'},
      {id:'tb_seatF',s:1,color:'var(--text3)',from:'G',to:'F',d:L(pt.G,pt.F),gov:'traced · seat'},
      {id:'tb_waistF',s:1,color:'var(--text3)',from:'K',to:'Lp',d:L(pt.K,pt.Lp),gov:'traced · W/4+0.5'},
      {id:'tb_crotchF',s:1,color:'var(--text3)',from:'K',to:'D',d:qCurve(pt.K,pt.D),gov:'traced · french K→D'},
      {id:'tb_sideF',s:1,color:'var(--text3)',from:'Lp',to:'R',d:vCurve(pt.Lp,pt.C)+' '+L(pt.C,pt.O1)+' '+L(pt.O1,pt.R),gov:'traced · side seam'},
      {id:'tb_inseamF',s:1,color:'var(--text3)',from:'D',to:'Q',d:L(pt.D,pt.P)+' '+L(pt.P,pt.Q),gov:'traced · inseam'},
      {id:'tb_creaseF',s:1,color:'var(--purple)',from:'M',to:'N',dash:true,d:L(pt.M,pt.N),gov:'traced · crease'},
      {id:'tb_kneeF',s:1,color:'var(--text3)',from:'P',to:'O1',dash:true,d:L(pt.P,pt.O1),gov:'traced · knee'},
      {id:'tb_moriF',s:1,color:'var(--text3)',from:'Q',to:'R',d:L(pt.Q,pt.R),gov:'traced · mori'},
      // ── Step 1 · back hip line ──
      {id:'tb_c1',s:1,color:'var(--text3)',from:'C',to:'C1',dash:true,d:L(pt.C,pt.C1),gov:'C↓0.5″'},
      {id:'tb_hip',s:1,color:'var(--accent)',from:'C1',to:'S',d:L(pt.C1,pt.S),gov:'C1→S · back hip line'},
      // ── Step 2 · knee & mori ──
      {id:'tb_kneemk',s:2,color:'var(--accent2)',from:'P',to:'P1',d:L(pt.P,pt.P1),gov:'H/36'},
      {id:'tb_morimk',s:2,color:'var(--accent2)',from:'Q',to:'T',d:L(pt.Q,pt.T),gov:'H/36'},
      {id:'tb_inseam',s:2,color:'var(--red)',from:'S',to:'T',man:true,d:crPath([pt.S,pt.P1,pt.T]),gov:'leg shaper · S→P1→T'},
      // ── Step 3 · back shape ──
      {id:'tb_umk',s:3,color:'var(--text3)',from:'M',to:'U',dash:true,d:L(pt.M,pt.U),gov:'H/12'},
      {id:'tb_shape',s:3,color:'var(--blue)',from:'Wp',to:'U',d:L(pt.Wp,pt.V)+' '+L(pt.V,pt.U),gov:'W→V→U · back shape'},
      {id:'tb_xmk',s:3,color:'var(--text3)',from:'K',to:'X',dash:true,d:L(pt.K,pt.X),gov:'K↑1.5″'},
      {id:'tb_seat',s:3,color:'var(--red)',from:'S',to:'X',man:true,
        d:crPath([pt.S,pt.Wp,pt.G1],pt.P1,{x:pt.Wp.x,y:pt.G1.y-2})+' '+L(pt.G1,pt.X),
        gov:'hip curve · S→W→G1→X'},
      // ── Step 4 · waist line & shape ──
      {id:'tb_g1a1',s:4,color:'var(--text3)',from:'G1',to:'A1',d:L(pt.G1,pt.A1),gov:'G1→A1'},
      {id:'tb_waist',s:4,color:'var(--accent)',from:'X',to:'Y',d:L(pt.X,pt.Y),gov:'W/4+1.5 · through A'},
      {id:'tb_side',s:4,color:'var(--red)',from:'Y',to:'C1',man:true,d:vCurve(pt.Y,pt.C1),gov:'hip curve · Y→C1'},
      // ── Step 5 · trouser dart ──
      {id:'tb_dart',s:5,color:'var(--accent2)',from:'Z',to:'Z1',d:L(pt.Z,pt.Z1),gov:'H/6−1'},
      {id:'tb_dartlegs',s:5,color:'var(--accent2)',from:'Z',to:'Z1',dash:true,d:legs,gov:'Z ± 0.5″'},
    ];},
    steps:[
      {n:1,en:'Back hip line',deps:[],formula:'C1 = C↓0.5 · D1 on D–E · D1→S = H/16',man:true},
      {n:2,en:'Knee & mori width',deps:['S'],formula:'P1 = P←H/36 · T = Q←H/36 · leg shaper S→P1→T',man:true},
      {n:3,en:'Back shape',deps:['M','K'],formula:'U = M↓H/12 · V lean · W = V←1.1 · X = K↑1.5',man:true},
      {n:4,en:'Waist line & shape',deps:['X','A'],formula:'A1 = mid A–C · X→Y = W/4+1.5 · hip Y→C1',man:true},
      {n:5,en:'Trouser dart',deps:['X','Y'],formula:'Z = mid X–Y · Z→Z1 = H/6−1 · Z ± 0.5″'},
    ],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g=''; const rx=sx(SW);
      if(cur===1){ g+=dimH(sx(pt.S.x),sx(pt.C1.x),sy(pt.C1.y)+38,`H/4+2 + H/16 = ${fmt(m.H/4+2+m.H/16)}″`);
        g+=dimH(sx(pt.S.x),sx(pt.D1.x),sy(pt.C1.y)-26,`H/16 = ${fmt(m.H/16)}″`); }
      if(cur===2){ g+=`<text class="dimtxt" x="${sx(pt.P1.x)-8}" y="${sy(pt.P1.y)-8}" text-anchor="end" fill="var(--accent2)">H/36 = ${fmt(m.H/36)}″</text>`;
        g+=`<text class="dimtxt" x="${sx(pt.T.x)-8}" y="${sy(pt.T.y)-8}" text-anchor="end" fill="var(--accent2)">H/36 = ${fmt(m.H/36)}″</text>`; }
      if(cur===3){ g+=dimV(sx(pt.M.x)+14,sy(pt.M.y),sy(pt.U.y),`H/12 = ${fmt(m.H/12)}″`);
        g+=`<text class="dimtxt" x="${sx(pt.Wp.x)-8}" y="${sy(pt.Wp.y)-9}" text-anchor="end" fill="var(--blue)">V ← 1.1″</text>`; }
      if(cur===4) g+=dimH(sx(pt.X.x),sx(pt.Y.x),sy(pt.X.y)-16,`W/4+1.5 = ${fmt(m.W/4+1.5)}″`);
      if(cur===5){ g+=dimV(sx(pt.Z.x)+16,sy(pt.Z.y),sy(pt.Z1.y),`H/6−1 = ${fmt(m.H/6-1)}″`);
        g+=`<text class="dimtxt" x="${sx(pt.Z.x)}" y="${sy(pt.Z.y)-16}" text-anchor="middle" fill="var(--accent2)">± 0.5″</text>`; }
      return g; },
  };

  /* ═══ PARTS 3 & 4 · THE TWO BELTS (1 step each) ══════════════════════ */
  function makeBelt(name, widthOf, extra, label){ return {
    name, cross:'', fold:false, scale:19, pad:40, mr:56, mb:34, foldDx:26,
    letters:{A:'A',B:'B',C:'C',D:'D'}, labs:{A:'r',B:'dr',C:'l',D:'dl'}, small:{},
    sheet:(m)=>({W:widthOf(m), H:m.BL}),
    points:(m)=>{ const SW=widthOf(m), SH=m.BL; return {
      A:{x:SW,y:0,s:1,gov:'origin',note:'belt end'},
      B:{x:SW,y:SH,s:1,gov:'BL',note:''},
      C:{x:0,y:0,s:1,gov:label,note:'belt width'},
      D:{x:0,y:SH,s:1,gov:'C↓BL',note:''},
    };},
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      const ex={x:pt.A.x-extra,y:0};
      return [
        {id:'bl_top',s:1,color:'var(--accent)',from:'C',to:'A',d:L(pt.C,pt.A),gov:label},
        {id:'bl_bot',s:1,color:'var(--green)',from:'D',to:'B',d:L(pt.D,pt.B),gov:'C→D→B'},
        {id:'bl_end1',s:1,color:'var(--red)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'BL'},
        {id:'bl_end2',s:1,color:'var(--red)',from:'C',to:'D',d:L(pt.C,pt.D),gov:'BL'},
        {id:'bl_extra',s:1,color:'var(--purple)',from:'A',to:'B',dash:true,d:L(ex,{x:ex.x,y:pt.B.y}),gov:`${extra}″ extra`},
      ];},
    steps:[{n:1,en:'Length & width',deps:[],formula:`A→B = BL · A→C = ${label} · ${extra}″ extra piece`}],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      g+=dimH(sx(0),sx(SW),sy(0)-18,`${label} = ${fmt(SW)}″`);
      g+=dimV(sx(SW)+38,sy(0),sy(SH),`BL = ${fmt(m.BL)}″`);
      g+=dimH(sx(SW-extra),sx(SW),sy(SH)+22,`${extra}″ extra`);
      return g; },
  };}
  const TR_BELT1 = makeBelt('Part 3 · First belt', (m)=>m.W/2+1,   1,   'W/2+1');
  const TR_BELT2 = makeBelt('Part 4 · Second belt',(m)=>m.W/2+2.5, 2.5, 'W/2+2.5');

  /* ═══ PART 5 · FLY (2 steps) ═════════════════════════════════════════ */
  const TR_FLY = {
    name:'Part 5 · Fly', cross:'', fold:false, scale:30, pad:38, mr:52, mb:24, foldDx:34,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G'},
    labs:{A:'r',B:'dr',C:'l',D:'dl',E:'u',F:'r',G:'d'}, small:{E:1,F:1,G:1},
    sheet:(m)=>({W:2, H:m.H/6+2}),
    points:(m)=>{ const SH=m.H/6+2; return {
      A:{x:2,y:0,s:1,gov:'origin',note:'top·CF'},
      B:{x:2,y:SH,s:1,gov:'H/6+2',note:'fly bottom'},
      C:{x:0,y:0,s:1,gov:'A←2″',note:'fly width'},
      D:{x:0,y:SH,s:1,gov:'C↓H/6+2',note:''},
      E:{x:1.5,y:0,s:2,gov:'A←0.5',note:''},
      F:{x:2,y:SH-0.5,s:2,gov:'B↑0.5',note:''},
      G:{x:1.5,y:SH,s:2,gov:'B←0.5',note:''},
    };},
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      return [
      {id:'fl_r',s:1,color:'var(--text3)',from:'A',to:'B',dash:true,d:L(pt.A,pt.B),gov:'H/6+2'},
      {id:'fl_l',s:1,color:'var(--text3)',from:'C',to:'D',dash:true,d:L(pt.C,pt.D),gov:'H/6+2'},
      {id:'fl_t',s:1,color:'var(--text3)',from:'C',to:'A',dash:true,d:L(pt.C,pt.A),gov:'2″'},
      {id:'fl_b',s:1,color:'var(--text3)',from:'D',to:'B',dash:true,d:L(pt.D,pt.B),gov:'2″'},
      {id:'fl_top',s:2,color:'var(--accent)',from:'C',to:'E',d:L(pt.C,pt.E),gov:'C→E'},
      {id:'fl_curveR',s:2,color:'var(--red)',from:'E',to:'F',man:true,d:qCurve(pt.E,pt.F),gov:'french · E→F'},
      {id:'fl_fg',s:2,color:'var(--green)',from:'F',to:'G',d:L(pt.F,pt.G),gov:'F→G'},
      {id:'fl_curveL',s:2,color:'var(--red)',from:'C',to:'G',man:true,d:qCurve(pt.C,pt.G),gov:'french · C→G'},
    ];},
    steps:[
      {n:1,en:'Length & width',deps:[],formula:'A→B = H/6+2 · A→C = 2″'},
      {n:2,en:'Fly shape',deps:['A','B'],formula:'E = A←0.5 · F = B↑0.5 · G = B←0.5 · french C→G, E→F',man:true},
    ],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      if(cur===1){ g+=dimV(sx(SW)+24,sy(0),sy(SH),`H/6+2 = ${fmt(m.H/6+2)}″`);
        g+=dimH(sx(0),sx(SW),sy(0)-16,`2″`); }
      if(cur===2) g+=dimH(sx(pt.G.x),sx(pt.B.x),sy(SH)+26,`0.5″`);
      return g; },
  };

  /* ═══ PART 6 · POCKET (3 steps) ══════════════════════════════════════ */
  const TR_POCKET = {
    name:'Part 6 · Pocket', cross:'', scale:15, pad:38, mr:66, mb:26, foldDx:46,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G'},
    labs:{A:'r',B:'dr',C:'l',D:'dl',E:'u',F:'l',G:'d'}, small:{E:1,F:1,G:1},
    sheet:(m)=>({W:7, H:m.PL}),
    points:(m)=>{ const SH=m.PL; return {
      A:{x:7,y:0,s:2,gov:'on fold',note:'top·fold'},
      B:{x:7,y:SH,s:2,gov:'PL',note:'hem·fold'},
      C:{x:0,y:0,s:2,gov:'A←7″',note:'top·open'},
      D:{x:0,y:SH,s:2,gov:'C↓PL',note:''},
      E:{x:1,y:0,s:2,gov:'C→1″',note:'mouth'},
      F:{x:0,y:SH-m.H/12,s:3,gov:'D↑H/12',note:''},
      G:{x:m.H/12,y:SH,s:3,gov:'D→H/12',note:''},
    };},
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      // hip curve E→F: eases into F with a vertical tangent, so it flows straight
      // into the quarter-round F→G without a kink
      const dyEF=(pt.F.y-pt.E.y);
      const ef=`M ${f2(pt.E.x)} ${f2(pt.E.y)} C ${f2(pt.E.x)} ${f2(pt.E.y+dyEF*0.5)} `
              +`${f2(pt.F.x)} ${f2(pt.F.y-dyEF*0.5)} ${f2(pt.F.x)} ${f2(pt.F.y)}`;
      return [
      {id:'pk_fold',s:2,color:'var(--purple)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'on fold'},
      {id:'pk_top',s:2,color:'var(--accent)',from:'C',to:'A',d:L(pt.C,pt.A),gov:'7″ · folded width'},
      {id:'pk_left',s:2,color:'var(--text3)',from:'C',to:'D',dash:true,d:L(pt.C,pt.D),gov:'PL'},
      {id:'pk_bot',s:2,color:'var(--text3)',from:'D',to:'B',dash:true,d:L(pt.D,pt.B),gov:'7″'},
      {id:'pk_mouth',s:2,color:'var(--green)',from:'E',to:'A',d:L(pt.E,pt.A),gov:'E→A · pocket mouth'},
      {id:'pk_curve',s:3,color:'var(--red)',from:'E',to:'G',man:true,d:ef+' '+qCurve(pt.F,pt.G),gov:'hip curve · E→F→G'},
      {id:'pk_hem',s:3,color:'var(--green)',from:'G',to:'B',d:L(pt.G,pt.B),gov:'G→B'},
    ];},
    steps:[
      {n:1,en:'Fold the sheet',deps:[],formula:'14 × PL  →  folded 7 × PL'},
      {n:2,en:'Length & width',deps:['sheet'],formula:'A→B = PL · A→C = 7″ · E = C→1″'},
      {n:3,en:'Pocket shape',deps:['D','E'],formula:'F = D↑H/12 · G = D→H/12 · hip curve E→F→G',man:true},
    ],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      if(cur===1) g+=`<text class="dimtxt" x="${sx(SW/2)}" y="${sy(SH/2)}" text-anchor="middle" fill="var(--purple)">fold the 14″ sheet in half → 7″ × ${fmt(m.PL)}″</text>`;
      if(cur>=2){ g+=dimH(sx(0),sx(7),sy(0)-16,`7″ (14″ folded)`);
        g+=dimV(sx(SW)+24,sy(0),sy(SH),`PL = ${fmt(m.PL)}″`);
        g+=dimH(sx(pt.C.x),sx(pt.E.x),sy(0)-30,`1″`); }
      if(cur===3){ g+=dimV(sx(0)-14,sy(pt.F.y),sy(SH),`H/12 = ${fmt(m.H/12)}″`);
        g+=dimH(sx(0),sx(pt.G.x),sy(SH)+18,`H/12 = ${fmt(m.H/12)}″`); }
      return g; },
  };

  /* ═══ FINISHED-TROUSER PREVIEW ═══════════════════════════════════════
     The flat garment is the Part-1 piece mirrored about the centre-front seam:
     half-waist = W/4+0.5, half-hip = H/4+2, knee and mori exactly as drafted.
     Nothing here is a free-hand proportion — every x and y is a corpus value. */
  function trouserGarment(m){
    const H=m.H,W=m.W,FL=m.FL,BL=m.BL,B=m.Bm,PL=m.PL;
    const SWp=H/4+2, tl=FL-BL, hipY=H/3-1;
    // Laid flat, the half-width at any level is half the circumference there, i.e.
    // the mean of the front and back piece widths at that level. Front from Part 1,
    // back from Part 2 (which is the front plus H/16 at the fork, H/36 at the knee
    // and the mori). Nothing here is chosen — each is a drafted width:
    const wH   = W/4+0.5;                    //   K→L                    · waist
    const hH   = (SWp + (SWp+H/16))/2;       // ½(D→C + S→C1)            · crotch line
    const gap  = H/36;                       //   P→P1 = Q→T · the back leg is
    //   H/36 wider than the front on the inseam side, so laid flat the two legs
    //   cannot meet on the centre line — each sits H/36 clear of it.
    const kOut = gap + (SWp + (SWp+H/36))/2; // ½(P→O1 + P1→O1)          · knee
    const mOut = gap + (B/2 + (B/2+H/36))/2; // ½(Q→R + T→R)             · mori
    const crease = (gap+mOut)/2;             //   M→N bisects the mori
    const cy=hipY-0.5;                       // crotch line below the waist line
    const Ly=tl-0.5;                         // hem   below the waist line
    const ky=(hipY+tl)/2-2-0.5;              // knee  below the waist line
    const vy=cy+H/12;                        // U = M↓H/12 · where the legs part
    const mIn=gap, kIn=gap;                  // inner (inseam) edge of each leg
    const bH=BL;                             // the belt sits above the waist line
    const b2=(W/2+2.5)/2;                    // half of the second (back) belt
    const flyW=2, flyL=H/6+2;                // Part 5
    const dartX=(W/4+1.5)/2, dartL=H/6-1;    // Part 2 · Z is mid X–Y
    const pkW=7, pkR=H/12;                   // Part 6
    const ssC1={x:wH,y:cy*0.5}, ssC2={x:hH,y:cy*0.5};   // waist→hip, hip curve
    const P0={x:wH,y:-bH};
    const R=[
      {c:lin({x:wH,y:-bH},{x:wH,y:0}),         end:{x:wH,y:0}},        // belt side
      {c:[ssC1,ssC2],                          end:{x:hH,y:cy}},       // side seam
      {c:lin({x:hH,y:cy},{x:kOut,y:ky}),       end:{x:kOut,y:ky}},     // thigh
      {c:lin({x:kOut,y:ky},{x:mOut,y:Ly}),     end:{x:mOut,y:Ly}},     // to the mori
      {c:lin({x:mOut,y:Ly},{x:mIn,y:Ly}),      end:{x:mIn,y:Ly}},      // mori
      {c:lin({x:mIn,y:Ly},{x:kIn,y:ky}),       end:{x:kIn,y:ky}},     // inseam · lower
      {c:lin({x:kIn,y:ky},{x:0,y:vy}),         end:{x:0,y:vy}},        // inseam → crotch
    ];
    let segs=[['M',P0]];
    R.forEach(s=>segs.push(['C',s.c[0],s.c[1],s.end]));
    for(let i=R.length-1;i>=0;i--){ const s=R[i], start=i===0?P0:R[i-1].end;
      segs.push(['C',{x:-s.c[1].x,y:s.c[1].y},{x:-s.c[0].x,y:s.c[0].y},{x:-start.x,y:start.y}]); }
    segs.push(['Z']);
    const pts=[]; segs.forEach(s=>{ for(let i=1;i<s.length;i++) pts.push(s[i]); });
    const xs=pts.map(p=>p.x), ys=pts.map(p=>p.y);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const TW=126, TH=178, k=Math.min(TW/(maxX-minX), TH/(maxY-minY));
    const ox=70-((minX+maxX)/2)*k, oy=97-((minY+maxY)/2)*k;
    const T=p=>({x:p.x*k+ox, y:p.y*k+oy});
    const base=segs.map(s=> s[0]==='M'?`M ${fmt2(T(s[1]))}`: s[0]==='Z'?'Z'
      : `C ${fmt2(T(s[1]))} ${fmt2(T(s[2]))} ${fmt2(T(s[3]))}`).join(' ');
    const seg=(a,b)=>`M ${fmt2(T(a))} L ${fmt2(T(b))}`;
    const cub=(a,c1,c2,e)=>`M ${fmt2(T(a))} C ${fmt2(T(c1))} ${fmt2(T(c2))} ${fmt2(T(e))}`;
    const mir=p=>({x:-p.x,y:p.y});
    const segM=(a,b)=>seg(a,b)+' '+seg(mir(a),mir(b));
    const pair=(a,c1,c2,e)=>cub(a,c1,c2,e)+' '+cub(mir(a),mir(c1),mir(c2),mir(e));
    // fly: the same quarter-round the Part-1 draft uses for K→D, at fly length
    const fc=qCtrl({x:flyW,y:0},{x:0,y:flyL});
    const flyPath=cub({x:flyW,y:0},fc[0],fc[1],{x:0,y:flyL});
    // Pocket bag, exactly as Part 6 draws it: the fold A–B lies against the side
    // seam, the mouth starts 1″ in from C at E, and the whole free edge is the one
    // hip curve E→F→G — a sweep that eases into F with a vertical tangent and then
    // flows without a kink into the H/12 corner round F→G.
    const pkA={x:wH,y:0},        pkC={x:wH-pkW,y:0},
          pkE={x:wH-pkW+1,y:0},  pkD={x:wH-pkW,y:PL},
          pkF={x:wH-pkW,y:PL-pkR}, pkG={x:wH-pkW+pkR,y:PL}, pkB={x:wH,y:PL};
    const pg=qCtrl(pkF,pkG), dEF=pkF.y-pkE.y;
    const pkBag=(sgn)=>{ const S=p=>({x:sgn*p.x,y:p.y});
      return `M ${fmt2(T(S(pkE)))} `
           + `C ${fmt2(T(S({x:pkE.x,y:pkE.y+dEF*0.5})))} ${fmt2(T(S({x:pkF.x,y:pkF.y-dEF*0.5})))} ${fmt2(T(S(pkF)))} `
           + `C ${fmt2(T(S(pg[0])))} ${fmt2(T(S(pg[1])))} ${fmt2(T(S(pkG)))} `
           + `L ${fmt2(T(S(pkB)))} L ${fmt2(T(S(pkA)))} Z`; };
    const pkSheet=(sgn)=>{ const S=p=>({x:sgn*p.x,y:p.y});
      return `M ${fmt2(T(S(pkA)))} L ${fmt2(T(S(pkC)))} L ${fmt2(T(S(pkD)))} L ${fmt2(T(S(pkB)))} Z`; };
    const creasePath=segM({x:crease,y:cy},{x:crease,y:Ly});
    const plain = creasePath+' '+seg({x:-wH,y:0},{x:wH,y:0})+' '+flyPath
                + ' '+seg({x:0,y:cy},{x:0,y:vy});
    const hl={
      length:  seg({x:0,y:0},{x:0,y:Ly}),
      hip:     seg({x:-hH,y:cy},{x:hH,y:cy}),
      // The two K→D crotch curves are sewn face to face, so on the finished
      // trouser the whole front rise reads as the centre seam from waist to fork.
      // The back S→W→G1→X seat curve is the same seam seen from the other side.
      rise:    seg({x:0,y:0},{x:0,y:vy}),
      seat:    seg({x:0,y:0},{x:0,y:vy}),
      riseB:   seg({x:0,y:0},{x:0,y:vy}),   // the same seam, drafted from the back
      fly:     flyPath,
      waistF:  seg({x:-wH,y:0},{x:wH,y:0}),
      crotch:  pair({x:flyW,y:0},fc[0],fc[1],{x:0,y:flyL}),
      sideUp:  pair({x:wH,y:0},ssC1,ssC2,{x:hH,y:cy}),
      sideLow: segM({x:hH,y:cy},{x:kOut,y:ky})+' '+segM({x:kOut,y:ky},{x:mOut,y:Ly}),
      crease:  creasePath,
      thigh:   segM({x:hH,y:cy},{x:0,y:vy}),
      knee:    segM({x:kIn,y:ky},{x:kOut,y:ky}),
      mori:    segM({x:mIn,y:Ly},{x:mOut,y:Ly}),
      hem:     segM({x:mIn,y:Ly},{x:mOut,y:Ly}),
      side:    pair({x:wH,y:0},ssC1,ssC2,{x:hH,y:cy})+' '+segM({x:hH,y:cy},{x:kOut,y:ky})
               +' '+segM({x:kOut,y:ky},{x:mOut,y:Ly}),
      inseam:  segM({x:0,y:vy},{x:kIn,y:ky})+' '+segM({x:kIn,y:ky},{x:mIn,y:Ly}),
      belt1:   seg({x:-wH,y:-bH},{x:wH,y:-bH})+' '+seg({x:-wH,y:0},{x:wH,y:0})
               +' '+segM({x:wH,y:-bH},{x:wH,y:0}),
      belt2:   seg({x:-b2,y:-bH},{x:b2,y:-bH})+' '+seg({x:-b2,y:0},{x:b2,y:0})
               +' '+segM({x:b2,y:-bH},{x:b2,y:0}),
      dart:    segM({x:dartX,y:0},{x:dartX,y:dartL}),
      pocket:  pkBag(1)+' '+pkBag(-1),
      pocketsheet: pkSheet(1)+' '+pkSheet(-1),
      pocketm: segM(pkE,pkA),
    };
    return {base,hl,plain,
            fold:{y1:T({x:0,y:-bH}).y, y2:T({x:0,y:cy}).y},
            box:{y0:T({x:0,y:minY}).y, y1:T({x:0,y:maxY}).y}};
  }

  /* ── trouser instructions (functions of the live values) ── */
  const INSTR_TR_FRONT = {
    1:{draft:(v,m)=>[
        `Take a sheet ${fmt(m.FL-m.BL)}″ long and ${fmt(m.H/4+2)}″ wide. Nothing is folded here — the trouser front is a single flat piece, cut twice (mirrored) for the two legs.`,
        `Mark A at the top-right corner. From A measure straight down ${fmt(m.FL-m.BL)}″ (FL − BL) and mark B. A→B is the trouser length: the full length minus the belt, because the belt adds its own ${fmt(m.BL)}″ at the top.`,
        `From A measure down ${fmt(m.H/3-1)}″ (H/3 − 1) and mark C — the hip point, which is also where the crotch sits.`,
        `From C measure ${fmt(m.H/4+2)}″ to the left and mark D. C→D is the front hip line. D is the fork tip; it is 2″ past the centre front, and that extra 2″ is what wraps under the body.`,
        `From D drop a line straight down to the bottom edge and mark E.`],
       sew:()=>"Nothing is stitched yet — but note that C→D governs the whole fit through the seat. Cut two of this piece, one reversed, so you get a left and a right leg.",
       tip:(v,m)=>`${fmt(m.H/4+2)}″ = Hip ÷ 4 + 2″. The +2 is the fork extension, not ease — trim it and the trousers will pull hard across the seat.`},
    2:{draft:(v,m)=>[
        `From D measure 2″ to the right and mark F. This 2″ is the standard front fork; F now sits on the centre-front line of the trouser.`,
        `From F rule a line straight up to the top edge of the sheet and mark G.`,
        `G→F is the front seat (rise) length — the vertical distance from the waist down to the crotch, ${fmt(m.H/3-1)}″ here.`],
       sew:()=>"G–F is the centre-front line: the fly (Part 5) is applied along it, and the two front legs are joined down the curve you will draw from it next.",
       tip:()=>"Keep G–F truly perpendicular to the hip line. If the rise leans, one leg will twist on the body no matter how well the rest is drafted."},
    3:{draft:(v,m)=>[
        `From G measure 0.5″ down the seat line and mark K. That half inch is the waist scoop — the centre front always sits a little below the side.`,
        `With a French curve join K to D. The curve leaves K straight down along the seat line and only turns out into D at the very bottom — that long J is the front crotch curve.`,
        `From K rule a horizontal line ${fmt(m.W/4+0.5)}″ (W/4 + 0.5) to the right and mark L. K→L is the front waist line.`,
        `With a hip curve join L down to C. L→C is the upper side seam, the shaping between waist and hip.`],
       sew:()=>"K–D is the centre-front seam: place the two fronts right sides together and stitch from K down to D, leaving the top open for the fly. Clip the curve so it lies flat.",
       tip:(v,m)=>`${fmt(m.W/4+0.5)}″ = Waist ÷ 4 + 0.5. Two fronts give ${fmt(m.W/2+1)}″ across the front waist — exactly the first belt width (W/2 + 1), so the two always agree.`},
    4:{draft:(v,m)=>[
        `Find the exact midpoint of the hip line D–C and mark M.`,
        `From M rule a line straight down to the bottom edge and mark N. M→N is the front crease line.`,
        `The crease is not a seam — it is the pressed fold that runs down the centre of the finished leg, and it also fixes where the mori is measured from.`],
       sew:()=>"After the leg seams are closed, press the crease along M–N with steam. On the finished trouser this line is what makes the leg hang straight.",
       tip:()=>"Mark M–N on the fabric with tailor's chalk before you sew anything — once the leg is a tube it is much harder to find the true centre."},
    5:{draft:(v,m)=>[
        `Mark O at the exact midpoint of the right edge C–B, then measure 2″ up from O and mark O1. O1 is the front knee level.`,
        `From O1 rule a line ${fmt(m.H/4+2)}″ to the left (the same H/4 + 2 as the hip) and mark P. O1→P is the front knee width — the front leg stays as wide at the knee as it is at the hip.`,
        `From N measure ${fmt(m.Bm/4)}″ (B/4) to each side and mark Q and R. Q→R is the front mori (hem) width, ${fmt(m.Bm/2)}″ across.`,
        `Join D→P→Q for the inseam and C→O1→R for the side seam. Both run straight to the knee and then taper gently in to the hem.`],
       sew:()=>"Stitch the inseam D–Q and the side seam C–R, right sides together, 1 cm allowance. Press both open, then finish the mori with a turned hem.",
       tip:(v,m)=>`The whole taper happens below the knee: ${fmt(m.H/4+2)}″ at O1 narrowing to ${fmt(m.Bm/2)}″ at the hem. Widen B for a straight leg, narrow it for a taper.`},
  };

  const INSTR_TR_BACK = {
    1:{draft:(v,m)=>[
        `Take a sheet ${fmt(m.FL)}″ long and ${fmt(m.H/4+2+m.H/16)}″ wide — that is the front sheet plus ${fmt(m.BL)}″ of height at the top and ${fmt(m.H/16)}″ of width on the fork side.`,
        `Trace the whole of Part 1 onto it first: the hip line D–C, the seat line G–F, the waist K–L, the crotch curve K–D, the side seam, the inseam, the crease M–N and the mori. Every back measurement is taken off those lines.`,
        `From C measure 0.5″ down and mark C1 — the start of the back hip line.`,
        `From C1 rule left as far as the line D–E and mark D1 where it lands. Then continue ${fmt(m.H/16)}″ further left and mark S.`,
        `C1→S is the back hip line: ${fmt(m.H/4+2+m.H/16)}″, wider than the front by exactly H/16.`],
       sew:()=>"The back is always the wider half — the extra H/16 at the fork is what gives room to sit down. Cut two, mirrored, like the fronts.",
       tip:(v,m)=>`H/16 = ${fmt(m.H/16)}″. Skip this extension and the trousers will feel tight the moment the wearer bends.`},
    2:{draft:(v,m)=>[
        `From P measure ${fmt(m.H/36)}″ (H/36) to the left and mark P1. O1→P1 is the back knee width — H/36 wider than the front.`,
        `From Q measure the same ${fmt(m.H/36)}″ to the left and mark T. R→T is the back mori width.`,
        `With a leg shaper join S → P1 → T in one continuous curve. It is not a straight line: it bows out under the seat and straightens as it drops past the knee.`],
       sew:()=>"The back inseam S–T is eased onto the front inseam D–Q. The back is slightly longer over the curve, so pin at the crotch, knee and hem first and spread the extra evenly.",
       tip:()=>"Both knee and mori grow by the same H/36 — the back is uniformly a touch wider all the way down, which keeps the side seam hanging straight."},
    3:{draft:(v,m)=>[
        `From M measure ${fmt(m.H/12)}″ (H/12) straight down and mark U — the back shape point, the deepest reach of the back fork.`,
        `Look along the traced curve K–D and find the point where it leans furthest from the straight line K–D; mark it V.`,
        `From V measure 1.1″ horizontally to the left and mark W.`,
        `Draw a line from W through V and on to U — that straight run is the back shape (the seat angle).`,
        `Mark G1 on the line G–F, level with the midpoint of A–C. Then from K measure 1.5″ straight up and mark X — the centre-back waist point.`,
        `With a hip curve join S → W → G1 → X in one sweep. That is the back seat curve, and it is the deepest curve in the whole draft.`],
       sew:()=>"S–W–G1–X is the centre-back seam. Stitch it last of the four long seams, and leave it a little wide so it can be let out later — that is what the extra width at the seat is for.",
       tip:()=>"X sits 1.5″ above the front waist K. That rise is what stops the back of the trousers dropping when the wearer sits."},
    4:{draft:(v,m)=>[
        `Mark A1 at the midpoint of A–C on the right edge, and join G1 to A1 — the line comes out horizontal, which confirms G1 was placed correctly.`,
        `From X rule a line ${fmt(m.W/4+1.5)}″ (W/4 + 1.5) long, passing through A, and mark its end Y. X→Y is the back waist line.`,
        `Because it runs through A, the back waist tips slightly downward toward the side — that slope is deliberate, it matches the rise you added at X.`,
        `With a hip curve join Y down to C1 — the back upper side seam.`],
       sew:()=>"Join the back side seam Y–C1 to the front side seam L–C. The 1″ difference between the front waist (W/4 + 0.5) and the back (W/4 + 1.5) is taken out by the dart in the next step.",
       tip:(v,m)=>`Back waist ${fmt(m.W/4+1.5)}″ vs front ${fmt(m.W/4+0.5)}″ — the extra inch is dart allowance, not ease.`},
    5:{draft:(v,m)=>[
        `Mark Z at the midpoint of the waist line X–Y.`,
        `From Z rule a line ${fmt(m.H/6-1)}″ (H/6 − 1) straight down and mark Z1. Z→Z1 is the trouser dart.`,
        `From Z measure 0.5″ to each side along the waist line and mark both points; draw a line from each down to Z1. Those two legs are what you actually stitch.`,
        `The dart takes out 1″ — exactly the difference between the back waist and the front waist.`],
       sew:()=>"Fold the dart along Z–Z1, stitch from the waist down to the tip, and run the last few stitches right off the fold so the point stays flat. Press the dart toward the centre back.",
       tip:()=>"Never backstitch at the dart tip — knot the threads instead, or you will get a hard little bubble over the seat."},
  };

  const INSTR_TR_BELT1 = {
    1:{draft:(v,m)=>[
        `Take a strip ${fmt(m.BL)}″ deep and ${fmt(m.W/2+1)}″ long. Mark A at the top-right corner.`,
        `From A measure ${fmt(m.BL)}″ down and mark B. A→B is the belt depth (BL).`,
        `From A measure ${fmt(m.W/2+1)}″ (W/2 + 1) to the left and mark C, then drop ${fmt(m.BL)}″ from C to D.`,
        `The last 1″ at the A end is the extra piece — the underlap that carries the button.`],
       sew:()=>"This band covers the front waist. Interface it, fold it in half lengthwise, and stitch it on with the 1″ extension projecting past the fly for the button.",
       tip:(v,m)=>`${fmt(m.W/2+1)}″ = Waist ÷ 2 + 1, which is exactly the two front waist lines (${fmt(m.W/4+0.5)}″ each) laid end to end — the belt can never come out the wrong length.`},
  };
  const INSTR_TR_BELT2 = {
    1:{draft:(v,m)=>[
        `Take a strip ${fmt(m.BL)}″ deep and ${fmt(m.W/2+2.5)}″ long. Mark A at the top-right corner.`,
        `From A measure ${fmt(m.BL)}″ down and mark B — the same depth as the first belt, so the two meet flush at the side seams.`,
        `From A measure ${fmt(m.W/2+2.5)}″ (W/2 + 2.5) to the left and mark C, then drop ${fmt(m.BL)}″ from C to D.`,
        `The last 2.5″ at the A end is the extra piece.`],
       sew:()=>"This is the back band. Join it to the first belt at the side seams so the two together ring the whole waist, then attach as one waistband.",
       tip:(v,m)=>`The back band is 1.5″ longer than the front one (${fmt(m.W/2+2.5)}″ vs ${fmt(m.W/2+1)}″) — that covers the seat curve and the dart take-up at the back.`},
  };

  const INSTR_TR_FLY = {
    1:{draft:(v,m)=>[
        `Take a strip ${fmt(m.H/6+2)}″ long and 2″ wide. Mark A at the top-right.`,
        `From A measure ${fmt(m.H/6+2)}″ (H/6 + 2) down and mark B. A→B is the fly length.`,
        `From A measure 2″ to the left and mark C — the fly width — and drop the same ${fmt(m.H/6+2)}″ from C to D.`],
       sew:()=>"The fly is applied along the centre-front line G–F of the left front, over the opening left above D in the crotch seam.",
       tip:(v,m)=>`${fmt(m.H/6+2)}″ = Hip ÷ 6 + 2. Notice it is shorter than the ${fmt(m.H/3-1)}″ rise — the fly stops well above the crotch, which is what keeps the seam from bulking there.`},
    2:{draft:()=>[
        `From A measure 0.5″ to the left and mark E. From B measure 0.5″ up and mark F, and 0.5″ to the left and mark G.`,
        `Join G to F with a straight line — that little 0.5″ chamfer softens the bottom corner.`,
        `With a French curve join C to G: the curve runs straight down the left edge and only swings across into G near the bottom.`,
        `With a French curve join E to F down the right edge. The finished piece is a tongue, wider at the top and rounded off at the bottom.`],
       sew:()=>"Fold the fly on C–G, press, and topstitch the curve through to the left front. The curve you just drew is the visible topstitching line on the finished trouser.",
       tip:()=>"Cut the fly on the straight grain, never on the bias — a bias fly stretches and the opening gapes after a few wears."},
  };

  const INSTR_TR_POCKET = {
    1:{draft:(v,m)=>[
        `Take a sheet ${fmt(m.PL)}″ long and 14″ wide.`,
        `Fold it in half lengthwise so it becomes ${fmt(m.PL)}″ × 7″. You draft on the folded half, exactly as for the kurti body.`,
        `The fold becomes the bottom of the finished bag, so the pocket comes out as one piece with no seam across the base.`],
       sew:()=>"Cut two pockets, one for each side. Because the base is on the fold there is only one seam to close, up the open edge.",
       tip:(v,m)=>`Pocket length PL = ${fmt(m.PL)}″. Deeper than it looks — the bag has to reach well below the hip line so nothing falls out when sitting.`},
    2:{draft:(v,m)=>[
        `Mark A at the top on the fold. From A measure ${fmt(m.PL)}″ down and mark B — A→B is the pocket length.`,
        `From A measure 7″ to the left and mark C, then drop ${fmt(m.PL)}″ from C to D.`,
        `From C measure 1″ to the right and mark E. A→E is the top width of the pocket, ${fmt(6)}″ — the pocket mouth.`],
       sew:()=>"A–E is the opening. It is set into the side seam, so the 1″ you took off at C is what the seam allowance and the facing eat up.",
       tip:()=>"Cut the mouth edge on the straight grain and stay-stitch it — a pocket opening that stretches never sits flat again."},
    3:{draft:(v,m)=>[
        `From D measure ${fmt(m.H/12)}″ (H/12) up the left edge and mark F.`,
        `From D measure the same ${fmt(m.H/12)}″ to the right along the bottom and mark G.`,
        `With a hip curve join E → F → G. It runs almost straight from E down to F, then rounds the corner into G.`,
        `That rounded corner is the pocket shape — a square corner would collect lint and fray, a round one turns out cleanly.`],
       sew:()=>"Stitch E–F–G, trim the seam close around the curve, turn and press. Then attach the bag to the front along the side seam and the waist.",
       tip:(v,m)=>`H/12 = ${fmt(m.H/12)}″ appears twice here and once again as the back shape (M↓U) — the manual reuses it as its standard corner radius.`},
  };
  TR_FRONT.instr  = INSTR_TR_FRONT;
  TR_BACK.instr   = INSTR_TR_BACK;
  TR_BELT1.instr  = INSTR_TR_BELT1;
  TR_BELT2.instr  = INSTR_TR_BELT2;
  TR_FLY.instr    = INSTR_TR_FLY;
  TR_POCKET.instr = INSTR_TR_POCKET;


    PARTS.trousers = {
      label:'Trousers', tag:"men's trouser · front (1–5) + back (1–5) + belts + fly + pocket", chart:'trouser',
      uses:['H','W','FL','BL','Bm','PL'],
      fieldLabels:{Bm:'Mohri width (B)'},
      phases:[TR_FRONT, TR_BACK, TR_BELT1, TR_BELT2, TR_FLY, TR_POCKET],
      garmentTitle:'Finished trousers — this step',
      garment:{ gen:trouserGarment, half:'right', HL:{
        1:{ids:['length','hip'],cap:'Trouser length (FL−BL) down the centre seam, and the front hip line (H/4+2) at the hip point H/3−1.'},
        2:{ids:['rise'],cap:'Seat length G→F — the centre-front rise, with the 2″ fork taken off D.'},
        3:{ids:['waistF','rise','sideUp'],cap:'Front waist (W/4+0.5), the crotch curve K→D — which becomes this centre seam — and the upper side seam L→C.'},
        4:{ids:['crease'],cap:'Crease line M→N — the pressed centre of each leg. Cut 2.'},
        5:{ids:['knee','mori','inseam','sideLow'],cap:'Knee (H/4+2) and mori (B/4 each side of N), with the inseam D→P→Q and the lower side seam C→O1→R.'},
        6:{ids:['hip','riseB'],cap:'Back hip line C1→S — H/16 wider than the front, all of it added at the fork.'},
        7:{ids:['knee','mori','inseam'],cap:'Back knee and mori, each H/36 wider than the front; the inseam S→P1→T is curved with a leg shaper.'},
        8:{ids:['riseB'],cap:'Back shape: U = M↓H/12, then the seat curve S→W→G1→X — the deepest curve in the draft, and the back face of this same centre seam.'},
        9:{ids:['waistF','sideUp'],cap:'Back waist line X→Y (W/4+1.5) through A, then the hip curve Y→C1 down the side seam.'},
        10:{ids:['waistF','dart'],cap:'Trouser dart at the middle of X–Y: H/6−1 long, 0.5″ each side — it takes the extra 1″ back out of the waist.'},
        11:{ids:['belt1','waistF'],cap:'First belt — W/2+1, which is exactly the two front waist lines end to end.'},
        12:{ids:['belt2'],cap:'Second belt — W/2+2.5, the back band, 1.5″ longer to cover the seat curve.'},
        13:{ids:['fly','rise'],cap:'Fly length H/6+2 and width 2″, applied down the centre-front seam.'},
        14:{ids:['fly'],cap:'Fly shape — the French curve C→G is the topstitching line you see on the finished trouser.'},
        15:{ids:['pocketsheet'],cap:'Pocket sheet folded 14″ → 7″; the fold sits against the side seam.'},
        16:{ids:['pocketsheet','pocketm'],cap:'Pocket length PL and the mouth A→E across the top of the folded piece.'},
        17:{ids:['pocket'],cap:'Pocket shape — the bottom corner rounded by H/12 so it turns out clean.'},
      }},
    };

  const ECO = PARTS.trousers;
  ECO.id = 'trousers';
  ECO.chartSizes = TROUSER_CHART;
  return ECO;
});
