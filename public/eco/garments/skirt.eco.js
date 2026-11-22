/* SILAI Executable Craft Object
   id      : skirt
   kind    : garment
   deps    : kit, geometry
   source  : Standard direct-draft A-line construction (drafting textbooks)
   note    : Not in the USHA manual; written in the corpus formula vocabulary
   This file is served from the SILAI object store (eco/manifest.json). The studio
   fetches it, checks its SHA-256 against the manifest, then runs the factory below.
   The drafting code inside is unchanged from the single-file studio. */
SILAI.define('skirt', ["kit", "geometry"], function (kit, geo) {
  const { fmt, V, dimH, dimV, crPath } = kit;
  const { bezAt, maxLean, fmt2, KAPPA, f2, qCtrl, qCurve, vCurve, lin, skUnit, skArc, skAtLen } = geo;
  const PARTS = {};   // this object's descriptor is written as PARTS.<id> below

  /* ═══════════════════════════════════════════════════════════════════
     WOMEN'S A-LINE SKIRT — three parts: 1 front · 2 back · 3 waistband
     NOT in the USHA manual. Built from the standard direct-draft A-line
     construction in drafting textbooks, written in the same quarter-formula
     style as the kurti/blouse so every value is a corpus-style expression:
       · hip  H/4+1   — the kurti's own hip width (Chapter 8)
       · waist W/4+1.25 — the blouse's waist formula (0.25″ ease + 1″ dart)
       · hip depth HD = 7″ — the kurti's G→I hip drop
       · flare Fl = 3″ per quarter — the textbook A-line amount (12″ round the hem)
     The exactness constraints are derived, not hand-tuned:
       · the flare line D→F0, run back up, meets the fold at O; the hem is the
         circular arc about O through B (exact arc cubic), so it is square to
         the fold at B and to the side seam at F, and level all round;
       · the waist leaves A square to the fold and meets E square to the side
         seam;
       · the hip curve E→D arrives at D along D→F, so the side seam has no kink;
       · the dart centre is the arc-length midpoint of the waist curve and its
         legs sit ±0.5″ along that same curve, square to it.
     ═══════════════════════════════════════════════════════════════════ */
  const SKIRT_CHART = {          // W and H from the Chapter 8 chart; SK = knee length
    small:  {W:26, H:34, SK:26, HD:7, Fl:3},
    medium: {W:28, H:36, SK:27, HD:7, Fl:3},
    large:  {W:30, H:38, SK:28, HD:7, Fl:3},
  };

  /* the one skirt skeleton — Part 1, Part 2 and the preview all read from it */
  function skGeom(m, back){
    const SW=m.H/4+1+m.Fl, SH=m.SK+0.5, dartLen=back?5:3.5;
    const A={x:SW,y:back?1:0.5};                       // CF 0.5″ below side waist; CB a further 0.5″
    const B={x:SW,y:SH};                               // hem on the fold
    const C={x:SW,y:0.5+m.HD}, D={x:SW-(m.H/4+1),y:C.y};   // hip line H/4+1
    const E={x:SW-(m.W/4+1.25),y:0};                   // side waist, raised 0.5″
    const F0={x:0,y:SH};                               // flare guide: D→hem, Fl″ out
    const u=skUnit({x:F0.x-D.x,y:F0.y-D.y});
    // swing the hem: the side line D–F0, run back up, meets the fold at O; the
    // hem is the arc about O through B, so it is square to the fold at B and
    // square to the side seam at F, and every point of it is the same distance
    // from O — a level hem by construction
    const tO=(SW-D.x)/u.x, O={x:SW, y:D.y+tO*u.y}, R=B.y-O.y;
    const F={x:O.x+u.x*R, y:O.y+u.y*R};
    const d0=skUnit({x:D.x-E.x,y:D.y-E.y}), kS=(D.y-E.y)*0.4;
    const sc=[{x:E.x+d0.x*kS,y:E.y+d0.y*kS},{x:D.x-u.x*kS,y:D.y-u.y*kS}];   // hip curve E→D
    let n0={x:d0.y,y:-d0.x}; if(n0.x<0) n0={x:-n0.x,y:-n0.y};
    const kW=(A.x-E.x)*0.4;
    const wc=[{x:A.x-kW,y:A.y},{x:E.x+n0.x*kW,y:E.y+n0.y*kW}];               // waist A→E
    let n1={x:-u.y,y:u.x}; if(n1.x<0) n1={x:-n1.x,y:-n1.y};
    const th=Math.acos(Math.max(-1,Math.min(1,u.y))), kH=4/3*Math.tan(th/4)*R;   // exact circular-arc cubic
    const hc=[{x:B.x-kH,y:B.y},{x:F.x+n1.x*kH,y:F.y+n1.y*kH}];               // hem B→F, arc about O
    const arc=skArc(A,wc[0],wc[1],E,240), mid=arc.len/2;
    const g=skAtLen(arc,mid), g1=skAtLen(arc,mid-0.5), g2=skAtLen(arc,mid+0.5);
    let p=skUnit({x:-g.ty,y:g.tx}); if(p.y<0) p={x:-p.x,y:-p.y};             // square to the waist, downward
    const G={x:g.x,y:g.y}, G1={x:g1.x,y:g1.y}, G2={x:g2.x,y:g2.y};
    const Hd={x:G.x+p.x*dartLen, y:G.y+p.y*dartLen};
    return {SW,SH,A,B,C,D,E,F,F0,O,R,u,sc,wc,hc,G,G1,G2,Hd,dartLen,waistLen:arc.len};
  }

  function makeSkirtPanel(name, back){ const W0=back?'CB':'CF';
    return {
    name, cross: back?'traced from Part 1':'', scale:13, pad:36, mr:70, mb:22, foldDx:58,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G',G1:'G1',G2:'G2',Hd:'H'},
    labs:{A:'r',B:'r',C:'r',D:'l',E:'u',F:'ur',G:'u',G1:'r',G2:'l',Hd:'r'},
    small:{G1:1,G2:1},
    sheet:(m)=>({W:m.H/4+1+m.Fl, H:m.SK+0.5}),
    points:(m)=>{ const g=skGeom(m,back), sH=back?1:2, sW=back?2:3, sF=back?2:4, sD=back?3:5;
      return {
        A:{...g.A,s:1,gov:back?'top↓1″':'top↓0.5″',note:`waist·${W0}`},
        B:{...g.B,s:1,gov:'A↓SK',note:'hem·fold'},
        C:{...g.C,s:sH,gov:'HD',note:'hip·fold'},
        D:{...g.D,s:sH,gov:'H/4+1',note:'hip·side'},
        E:{...g.E,s:sW,gov:'W/4+1.25',note:'waist·side'},
        F:{...g.F,s:sF,gov:'arc about O',note:'hem·side'},
        G:{...g.G,s:sD,gov:'mid waist',note:'dart centre'},
        G1:{...g.G1,s:sD,gov:'G−0.5″',note:''}, G2:{...g.G2,s:sD,gov:'G+0.5″',note:''},
        Hd:{...g.Hd,s:sD,gov:`${g.dartLen}″`,note:'dart tip'},
        _g:g,
      };},
    edges:(pt)=>{ const g=pt._g, L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      const cub=(a,c,b)=>`M ${f2(a.x)} ${f2(a.y)} C ${f2(c[0].x)} ${f2(c[0].y)} ${f2(c[1].x)} ${f2(c[1].y)} ${f2(b.x)} ${f2(b.y)}`;
      const sH=back?1:2, sW=back?2:3, sF=back?2:4, sD=back?3:5;
      return [
        {id:'sk_fold',s:1,color:'var(--purple)',from:'A',to:'B',d:L(g.A,g.B),gov:`${W0} · on fold`},
        {id:'sk_hip',s:sH,color:'var(--accent)',from:'D',to:'C',d:L(g.D,g.C),gov:'H/4+1 · hip line'},
        {id:'sk_waist',s:sW,color:'var(--red)',from:'A',to:'E',man:true,d:cub(g.A,g.wc,g.E),gov:'french · A→E · square at both ends'},
        {id:'sk_sideup',s:sW,color:'var(--red)',from:'E',to:'D',man:true,d:cub(g.E,g.sc,g.D),gov:'hip curve · E→D'},
        {id:'sk_flare',s:sF,color:'var(--text3)',from:'D',to:'F',dash:true,d:L({x:g.D.x+(g.D.x-g.F0.x)*(g.D.y/(g.F0.y-g.D.y)),y:0},g.D)+' '+L(g.F,g.F0),gov:'flare guide · runs on up to O on the fold'},
        {id:'sk_sidelow',s:sF,color:'var(--red)',from:'D',to:'F',d:L(g.D,g.F),gov:'D→F on the flare line'},
        {id:'sk_hem',s:sF,color:'var(--green)',from:'B',to:'F',man:true,d:cub(g.B,g.hc,g.F),gov:'hem · arc about O'},
        {id:'sk_dartc',s:sD,color:'var(--text3)',from:'G',to:'Hd',dash:true,d:L(g.G,g.Hd),gov:'dart centre'},
        {id:'sk_dart',s:sD,color:'var(--accent2)',from:'G1',to:'G2',d:L(g.G1,g.Hd)+' '+L(g.G2,g.Hd),gov:`1″ × ${g.dartLen}″ dart`},
      ];},
    steps: back ? [
        {n:1,en:'Frame & hip line',deps:[],formula:'trace Part 1 · A = top↓1″ (CB −0.5″) · C→D = H/4+1',man:false},
        {n:2,en:'Waist, side seam & hem',deps:['A','D'],formula:'E = W/4+1.25 · hip E→D · hem arc about O',man:true},
        {n:3,en:'Back dart',deps:['A','E'],formula:'G = mid waist · 1″ wide · 5″ long',man:true},
      ] : [
        {n:1,en:'Fold the sheet',deps:[],formula:'sheet (SK+0.5) × (H/4+1+Fl) · A = top↓0.5″ · A→B = SK'},
        {n:2,en:'Hip line',deps:['A'],formula:'A→C = HD · C→D = H/4+1'},
        {n:3,en:'Waist line',deps:['A'],formula:'E = W/4+1.25 at top · french A→E · hip E→D',man:true},
        {n:4,en:'Flare & hem',deps:['D','B'],formula:'D→F0 (Fl out) · O on fold · hem = arc OB → F',man:true},
        {n:5,en:'Front dart',deps:['A','E'],formula:'G = mid waist · 1″ wide · 3.5″ long',man:true},
      ],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ const g=pt._g, foldX=sx(SW); let s='';
      const sH=back?1:2, sW=back?2:3, sF=back?2:4, sD=back?3:5;
      if(cur===1){ s+=dimV(foldX+30,sy(g.A.y),sy(g.B.y),`SK${back?'−0.5':''} = ${fmt(g.B.y-g.A.y)}″`);
        s+=`<text class="dimtxt" x="${foldX+8}" y="${sy(g.A.y/2)+4}" fill="var(--accent2)">${back?'1″ (0.5 rise + 0.5 CB drop)':'0.5″ rise'}</text>`; }
      if(cur===sH){ s+=dimV(foldX+16,sy(g.A.y),sy(g.C.y),`HD = ${fmt(g.C.y-g.A.y)}″`);
        s+=dimH(sx(g.D.x),sx(g.C.x),sy(g.C.y)-9,`H/4+1 = ${fmt(m.H/4+1)}″`); }
      if(cur===sW) s+=dimH(sx(g.E.x),sx(SW),sy(0)-30,`W/4+1.25 = ${fmt(m.W/4+1.25)}″`);
      if(cur===sF){ s+=dimH(sx(g.F0.x),sx(g.D.x),sy(SH)+18,`flare Fl = ${fmt(m.Fl)}″`);
        const tx=sx(SW*0.56), ty=sy((g.C.y+g.B.y)/2);
        s+=`<text class="dimtxt" x="${tx}" y="${ty}" text-anchor="middle" fill="var(--text2)">O: on fold, ${fmt(-g.O.y)}″ up</text>`;
        s+=`<text class="dimtxt" x="${tx}" y="${ty+14}" text-anchor="middle" fill="var(--text2)">hem radius OB = ${fmt(g.R)}″</text>`; }
      if(cur===sD) s+=`<text class="dimtxt" x="${sx(g.Hd.x)-12}" y="${sy(g.Hd.y)+4}" text-anchor="end" fill="var(--accent2)">dart 1″ × ${g.dartLen}″</text>`;
      return s; },
  };}
  const SKIRT_FRONT = makeSkirtPanel('Part 1 · Skirt front', false);
  const SKIRT_BACK  = makeSkirtPanel('Part 2 · Skirt back', true);

  /* ── Part 3 · Waistband (2 steps) — cut flat, folded lengthwise when sewn ── */
  const SKIRT_BAND = {
    name:'Part 3 · Waistband', cross:'', fold:false, scale:9, pad:38, mr:40, mb:30, foldDx:0,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G',Gb:'G1'},
    labs:{A:'ur',B:'dr',C:'ul',D:'dl',E:'r',F:'l',G:'u',Gb:'d'}, small:{E:1,F:1,G:1,Gb:1},
    sheet:(m)=>({W:m.W+2.5, H:3}),
    points:(m)=>{ const SW=m.W+2.5; return {
      A:{x:SW,y:0,s:1,gov:'origin',note:'band·end'}, B:{x:SW,y:3,s:1,gov:'3″',note:''},
      C:{x:0,y:0,s:1,gov:'W+2.5',note:'band·overlap end'}, D:{x:0,y:3,s:1,gov:'C↓3″',note:''},
      E:{x:SW,y:1.5,s:2,gov:'mid A–B',note:'fold'}, F:{x:0,y:1.5,s:2,gov:'mid C–D',note:'fold'},
      G:{x:1.5,y:0,s:2,gov:'C→1.5″',note:'overlap'}, Gb:{x:1.5,y:3,s:2,gov:'D→1.5″',note:''},
    };},
    edges:(pt)=>{ const L=(a,b)=>`M ${f2(a.x)} ${f2(a.y)} L ${f2(b.x)} ${f2(b.y)}`;
      return [
        {id:'bd_top',s:1,color:'var(--accent)',from:'C',to:'A',d:L(pt.C,pt.A),gov:'W+2.5'},
        {id:'bd_bot',s:1,color:'var(--green)',from:'D',to:'B',d:L(pt.D,pt.B),gov:'W+2.5'},
        {id:'bd_r',s:1,color:'var(--red)',from:'A',to:'B',d:L(pt.A,pt.B),gov:'3″'},
        {id:'bd_l',s:1,color:'var(--red)',from:'C',to:'D',d:L(pt.C,pt.D),gov:'3″'},
        {id:'bd_fold',s:2,color:'var(--purple)',from:'F',to:'E',dash:true,d:L(pt.F,pt.E),gov:'fold line'},
        {id:'bd_lap',s:2,color:'var(--accent2)',from:'G',to:'Gb',dash:true,d:L(pt.G,pt.Gb),gov:'1.5″ overlap'},
      ];},
    steps:[
      {n:1,en:'Length & width',deps:[],formula:'A→C = W+2.5 (W+1 skirt waist + 1.5 overlap) · A→B = 3″'},
      {n:2,en:'Fold & overlap',deps:['A','C'],formula:'E–F = fold at 1.5″ · G = C→1.5″ overlap'},
    ],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      g+=dimH(sx(0),sx(SW),sy(0)-18,`W+2.5 = ${fmt(SW)}″`);
      g+=dimV(sx(SW)+20,sy(0),sy(SH),`3″`);
      if(cur===2) g+=dimH(sx(0),sx(1.5),sy(SH)+20,`1.5″ overlap`);
      return g; },
  };

  /* ── skirt instructions (functions of the live values) ── */
  const INSTR_SKIRT_FRONT = {
    1:{draft:(v,m)=>[
        `Take a sheet ${fmt(m.SK+0.5)}″ long and ${fmt((m.H/4+1+m.Fl)*2)}″ wide, and fold it in half lengthwise → ${fmt(m.SK+0.5)}″ × ${fmt(m.H/4+1+m.Fl)}″. The fold is the centre front.`,
        `The top edge of the sheet is the side-waist level. Mark A on the fold 0.5″ below it — the centre-front waist sits half an inch lower than the side, because the body curves down to the front at the waist.`,
        `From A measure ${fmt(m.SK)}″ (SK, the skirt length) straight down the fold and mark B — the hem on the centre front.`],
       sew:()=>"Cut the front on the fabric fold, so it opens out as one symmetric piece with no centre-front seam.",
       tip:()=>"Measure SK from the natural waist to where you want the hem; knee length is the default here. The waistband adds nothing to the length, it sits above the waist."},
    2:{draft:(v,m)=>[
        `From A measure ${fmt(m.HD)}″ (HD, the hip depth) down the fold and mark C — the hip level. HD = 7″ is the same waist-to-hip drop the kurti uses (G→I).`,
        `From C rule a line ${fmt(m.H/4+1)}″ (H/4+1) toward the open edge and mark D. C–D is the hip line — the same H/4+1 the kurti body uses, so the skirt has the kurti's hip ease.`],
       sew:null,
       tip:()=>"The hip line fixes the widest part of the skirt. Never cut it narrower than H/4 + 1 — a skirt can be loose at the hem, but it must pass over the hip."},
    3:{draft:(v,m)=>[
        `On the top edge measure ${fmt(m.W/4+1.25)}″ (W/4 + 1.25) from the fold and mark E — the side waist. That is ¼ waist + 0.25″ ease + 1″ that the dart will take out, the same W/4+1.25 as the blouse waist.`,
        `With a French curve join A to E — the waist line. It leaves A square to the fold and arrives at E square to the side seam, so the two halves meet with no point at the centre and no dip at the side.`,
        `With a hip curve join E down to D — the upper side seam. Let it arrive at D already heading the way the lower side seam will run.`],
       sew:()=>"Stay-stitch the waist curve A–E just inside the cut edge as soon as you cut it; a curved, partly bias edge stretches easily and the waistband will then not fit.",
       tip:()=>"Notice A sits lower than E. On the finished skirt the waistband straightens this curve out, and the 0.5″ is what stops the front from riding up."},
    4:{draft:(v,m)=>[
        `On the bottom edge mark F0 ${fmt(m.Fl)}″ (the flare, Fl) beyond the hip width — i.e. at the open corner of the sheet — and rule a guide from D to F0. That line sets the A-line angle.`,
        `Extend that guide upward past D until it meets the fold line, and mark O. O is the centre the flared skirt swings from.`,
        `Hold a tape at O, set it to O→B, and swing it across to the flare line: where it lands is F. Draw the hem along that swing from B to F. Every point of the hem is the same distance from O, so it is square to the fold at B, square to the side seam at F, and hangs level all round instead of dipping at the sides.`],
       sew:()=>"Stitch the side seam E–D–F to the back, right sides together, 1 cm allowance. Leave the left side open about 7″ from the waist for the zip. Turn up a narrow hem along B–F.",
       tip:(v,m)=>`${fmt(m.Fl)}″ of flare per quarter adds ${fmt(m.Fl*4)}″ round the hem — a classic A-line. Set Fl to 0 for a straight skirt, or 5–6″ for a fuller one.`},
    5:{draft:()=>[
        "Find the middle of the waist curve A–E (measure along the curve, not straight across) and mark G.",
        "From G measure 0.5″ each way along the curve and mark G1 and G2 — a 1″ dart opening.",
        "From G draw a line 3.5″ long, square to the waist curve, and mark the tip H. Join G1→H and G2→H — the front dart."],
       sew:()=>"Fold the dart along G–H, stitch from the waist to the tip, and run the last stitches off the fold. Press it toward the centre front.",
       tip:()=>"The front dart is short (3.5″) because the front of the body curves gently; a longer front dart makes a bubble over the tummy."},
  };
  const INSTR_SKIRT_BACK = {
    1:{draft:(v,m)=>[
        `Fold a sheet the same size as the front, ${fmt(m.SK+0.5)}″ × ${fmt(m.H/4+1+m.Fl)}″. The fold is now the centre back.`,
        "Trace the hip line C–D and the hem point B straight across from Part 1 — the back has the same hip width, length and flare as the front.",
        `Mark A on the fold 1″ below the top edge — 0.5″ lower than on the front. The centre back waist drops below the side because of the curve of the lower back; without it, the skirt pulls up at the back.`],
       sew:()=>"Cut the back on the fold too. The zip goes in the left side seam, so neither the front nor the back needs a centre seam.",
       tip:()=>"The back is the same size as the front: the difference is only in where the waist sits and how long the dart is."},
    2:{draft:(v,m)=>[
        `Mark E at ${fmt(m.W/4+1.25)}″ (W/4+1.25) on the top edge, exactly as on the front, and draw the waist A→E and the hip curve E→D the same way.`,
        `Draw the lower side seam D→F and swing the hem from O exactly as on the front — the flare line and O are the same, so the back side seam matches the front one stitch for stitch.`],
       sew:()=>"Join front and back at the right side seam fully, and at the left side seam from F up to the zip opening.",
       tip:()=>"Lay the front on the back and check E, D and F coincide before cutting — if the side seams do not match, the skirt will twist."},
    3:{draft:()=>[
        "Find the middle of the back waist curve and mark G; mark G1 and G2 0.5″ each way along the curve.",
        "From G draw a line 5″ long, square to the waist, to the tip H, and join G1→H and G2→H — the back dart."],
       sew:()=>"Stitch the back dart from the waist to the tip and press it toward the centre back.",
       tip:()=>"The back dart is longer (5″ against 3.5″) because the seat is fuller than the tummy and sits lower."},
  };
  const INSTR_SKIRT_BAND = {
    1:{draft:(v,m)=>[
        `Take a strip ${fmt(m.W+2.5)}″ long and 3″ wide. Mark A at the top-right, B 3″ below it, C ${fmt(m.W+2.5)}″ to the left of A and D below C.`,
        `${fmt(m.W+2.5)}″ is the skirt's waist edge (four times W/4+0.25 = W+1, once the darts are closed) plus 1.5″ of overlap for the button or hook.`],
       sew:()=>"Interface the band so it doesn't roll. Measure the finished skirt waist with the darts stitched before cutting — it should be W+1.",
       tip:()=>"Cut the waistband on the straight grain, along the selvedge, so it never stretches."},
    2:{draft:()=>[
        "Mark E and F halfway down each end (1.5″) and join them — the fold line. The band finishes 1.5″ deep.",
        "From C measure 1.5″ toward A and mark G (and G1 below it) — the overlap that carries the button or hook."],
       sew:()=>"Stitch one long edge to the skirt waist from A to G, right sides together, fold along E–F, turn under and slipstitch or stitch-in-the-ditch. Put the buttonhole on the A end and the button on the overlap.",
       tip:()=>"Put the overlap on the back side of the left zip opening, so the closure sits flat and out of sight."},
  };
  SKIRT_FRONT.instr = INSTR_SKIRT_FRONT;
  SKIRT_BACK.instr  = INSTR_SKIRT_BACK;
  SKIRT_BAND.instr  = INSTR_SKIRT_BAND;


  /* ═══ FINISHED-SKIRT PREVIEW — the front panel mirrored about CF, with the
     dart closed (half-waist W/4+0.25) and the waist straightened by the band.
     Hip, hem and side-seam angle come straight from skGeom.             ═══ */
  function skirtGarment(m){
    const gf=skGeom(m,false), gb=skGeom(m,true), SW=gf.SW;
    const wW=m.W/4+0.25, hH=m.H/4+1, HD=m.HD, SK=m.SK, bH=1.5;
    const hip={x:hH,y:HD}, hem={x:SW-gf.F.x, y:gf.F.y-0.5};
    const u=skUnit({x:hem.x-hip.x,y:hem.y-hip.y});
    const kS=HD*0.4;
    const sc1={x:wW+(hH-wW)*0.25,y:HD*0.35}, sc2={x:hip.x-u.x*kS,y:hip.y-u.y*kS};
    let n1={x:u.y,y:-u.x}; if(n1.x>0) n1={x:-n1.x,y:-n1.y};          // toward the centre
    const kH=4/3*Math.tan(Math.acos(Math.max(-1,Math.min(1,gf.u.y)))/4)*gf.R;   // same arc as the draft
    const hc1={x:hem.x+n1.x*kH,y:hem.y+n1.y*kH}, hc2={x:kH,y:SK};
    const P0={x:wW,y:-bH};
    const R=[
      {c:lin(P0,{x:wW,y:0}),        end:{x:wW,y:0}},     // band side
      {c:[sc1,sc2],                 end:hip},            // hip curve
      {c:lin(hip,hem),              end:hem},            // A-line side seam
      {c:[hc1,hc2],                 end:{x:0,y:SK}},     // hem
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
    // darts: same distance from the centre as drafted, scaled to the closed waist
    const dfx=(SW-gf.G.x)*(wW/(m.W/4+1.25)), dbx=(SW-gb.G.x)*(wW/(m.W/4+1.25));
    const fdart=segM({x:dfx-0.5,y:0},{x:dfx,y:gf.dartLen})+' '+segM({x:dfx+0.5,y:0},{x:dfx,y:gf.dartLen});
    const bdart=segM({x:dbx,y:0},{x:dbx,y:gb.dartLen});
    const plain = seg({x:-wW,y:0},{x:wW,y:0})+' '+segM({x:dfx,y:0},{x:dfx,y:gf.dartLen});
    const hl={
      length: seg({x:0,y:0},{x:0,y:SK}),
      hip:    seg({x:-hH,y:HD},{x:hH,y:HD}),
      waist:  seg({x:-wW,y:0},{x:wW,y:0}),
      side:   pair({x:wW,y:0},sc1,sc2,hip)+' '+segM(hip,hem),
      hem:    pair(hem,hc1,hc2,{x:0,y:SK}),
      fdart,
      skbdart: bdart,
      band:   seg({x:-wW,y:-bH},{x:wW,y:-bH})+' '+seg({x:-wW,y:0},{x:wW,y:0})+' '+segM({x:wW,y:-bH},{x:wW,y:0}),
    };
    return {base,hl,plain,
            fold:{y1:T({x:0,y:-bH}).y, y2:T({x:0,y:SK}).y},
            box:{y0:T({x:0,y:minY}).y, y1:T({x:0,y:maxY}).y}};
  }




  /* ── skirt PARTS entry — 3 phases, 10 steps ── */
  PARTS.skirt = {
    label:'Women\u2019s A-line Skirt', tag:"A-line skirt \u00b7 front(1-5) \u00b7 back(1-3) \u00b7 waistband(1-2) \u00b7 textbook draft, not USHA",
    chart:'skirt',
    uses:['W','H','SK','HD','Fl'],
    phases:[SKIRT_FRONT, SKIRT_BACK, SKIRT_BAND],
    garmentTitle:'Finished skirt \u2014 this step',
    garment:{ gen:skirtGarment, HL:{
      1:{ids:['length'],cap:'Front drafted on the fold \u2014 the centre line is the skirt length SK, from the centre-front waist.'},
      2:{ids:['hip'],cap:'Hip line H/4+1, HD = 7\u2033 below the waist \u2014 the widest fixed point of the skirt.'},
      3:{ids:['waist','side'],cap:'Waist W/4+1.25 (0.25\u2033 ease + 1\u2033 dart) and the hip curve down to the hip line.'},
      4:{ids:['side','hem'],cap:'A-line flare Fl at the hem; the hem is swung from O, so it hangs level.'},
      5:{ids:['fdart'],cap:'Front dart \u2014 1\u2033 wide, 3.5\u2033 long, at the middle of the waist curve.'},
      6:{ids:['length','hip'],cap:'Back panel \u2014 same hip, length and flare as the front; the centre back sits 0.5\u2033 lower.'},
      7:{ids:['waist','side','hem'],cap:'Back waist, side seam and hem \u2014 the side seam matches the front exactly.'},
      8:{ids:['skbdart'],cap:'Back dart \u2014 1\u2033 wide, 5\u2033 long (dashed: it is on the far face of the skirt).'},
      9:{ids:['band'],cap:'Waistband \u2014 W+1 to match the skirt waist, plus 1.5\u2033 overlap.'},
      10:{ids:['band'],cap:'Waistband folded to 1.5\u2033, with the overlap for the button or hook.'},
    }},
  };


  const ECO = PARTS.skirt;
  ECO.id = 'skirt';
  ECO.chartSizes = SKIRT_CHART;
  return ECO;
});
