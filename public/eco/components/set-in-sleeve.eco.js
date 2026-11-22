/* SILAI Executable Craft Object
   id      : set-in-sleeve
   kind    : component
   deps    : kit
   source  : USHA Silai School tailoring manual (Zarapkar drafting system) - Kurti sleeve
   note    : Also used by the blouse sleeve
   This file is served from the SILAI object store (eco/manifest.json). The studio
   fetches it, checks its SHA-256 against the manifest, then runs the factory below.
   The drafting code inside is unchanged from the single-file studio. */
SILAI.define('set-in-sleeve', ["kit"], function (kit) {
  const { fmt, V, dimH, dimV, crPath } = kit;

  /* ═══ PHASE: SLEEVE (4 steps) ═════════════════════════════════════════ */
  function makeSleeve(name, capSplit){ return {
    name, capSplit,
    scale:26, pad:36, mr:34, mb:24, foldDx:34,
    letters:{A:'A',B:'B',C:'C',D:'D',E:'E',F:'F',G:'G',H:'H',I:'I',J:'J'},
    labs:{A:'r',B:'l',C:'r',D:'l',E:'dl',F:'dr',G:'u',H:'ul',I:'u',J:'dl'},
    small:{F:1,G:1,H:1,I:1,J:1},
    sheet:(m)=>({W:m.C/4-0.5, H:m.SL}),
    points:(m)=>{ const W=m.C/4-0.5, SL=m.SL, cap=m.C/12, mori=m.Bm/2;
      const A={x:W,y:0},B={x:0,y:0},C={x:W,y:SL},D={x:0,y:cap},E={x:W-mori,y:SL};
      const dvx=D.x-A.x,dvy=D.y-A.y,dl=Math.hypot(dvx,dvy)||1, nx=-dvy/dl,ny=dvx/dl;
      const along=t=>({x:A.x+t*dvx,y:A.y+t*dvy}); const F=along(.25),G=along(.5),H=along(.75);
      const I={x:F.x+.5*nx,y:F.y+.5*ny}, J={x:H.x-.4*nx,y:H.y-.4*ny};
      return {
        A:{...A,s:2,gov:'on fold',note:'cap peak'}, B:{...B,s:2,gov:'corner',note:'top outer'},
        C:{...C,s:2,gov:'SL',note:'hem·fold'}, D:{...D,s:3,gov:'C/12',note:'underarm'},
        E:{...E,s:3,gov:'B/2',note:'hem outer'}, F:{...F,s:4,gov:'¼ A–D',note:''},
        G:{...G,s:4,gov:'½ A–D',note:'curve thru'}, H:{...H,s:4,gov:'¾ A–D',note:''},
        I:{...I,s:4,gov:'+0.5″',note:'bulge'}, J:{...J,s:4,gov:'−0.4″',note:'scoop'}, _n:{nx,ny},
      };},
    edges:(pt)=>{ const L=(a,b)=>`M ${a.x} ${a.y} L ${b.x} ${b.y}`; const n=pt._n;
      // EXACT corpus construction — every point derived from the measurements:
      // A–D quartered → F,G,H ; I = F + 0.5″⊥ (crown) ; J = H − 0.4″⊥ (scoop).
      // 4.5 front cap runs A · I · G · J · D — I (+0.5″ at F) is what crowns it.
      // 4.6 back cap is drawn A · G · D, held capSplit deeper at J. It is never
      // pulled out to I, so above G it rides the quarter point F — i.e. the A–D
      // chord itself. That gap against the front crown is the lens the manual
      // draws, and both curves converge into the corner A.
      const Jb = {x: pt.J.x - capSplit*n.nx, y: pt.J.y - capSplit*n.ny};
      const front = crPath([pt.A, pt.I, pt.G, pt.J, pt.D]);
      const back  = crPath([pt.A, pt.F, pt.G, Jb, pt.D]);   // rides F, i.e. the chord
      return [
        {id:'top_guide',s:2,color:'var(--text3)',from:'B',to:'A',dash:true,d:L(pt.B,pt.A),gov:'C/4−0.5 (construction)'},
        {id:'sleeve_fold',s:2,color:'var(--purple)',from:'A',to:'C',d:L(pt.A,pt.C),gov:'SL · on fold'},
        {id:'left_guide',s:3,color:'var(--text3)',from:'B',to:'D',dash:true,d:L(pt.B,pt.D),gov:'C/12 (construction)'},
        {id:'underarm_seam',s:3,color:'var(--red)',from:'D',to:'E',d:L(pt.D,pt.E),gov:'D→E underarm'},
        {id:'sleeve_hem',s:3,color:'var(--green)',from:'E',to:'C',d:L(pt.E,pt.C),gov:'mori B/2'},
        {id:'ad_chord',s:4,color:'var(--text3)',from:'A',to:'D',dash:true,d:L(pt.A,pt.D),gov:'quarter reference'},
        {id:'front_cap',s:4,color:'var(--accent)',from:'A',to:'D',man:true,d:front,gov:'french · straight-arm (A·I·G·J·D)'},
        {id:'back_cap',s:4,color:'var(--blue)',from:'A',to:'D',man:true,d:back,gov:`french · reverse +${capSplit}″ at J`},
      ];},
    steps:[
      {n:1,en:'Fold the sheet',deps:[],formula:'17 × 7  →  folded 8.5 × 7'},
      {n:2,en:'Length & width',deps:['sheet'],formula:'A→C = SL · A→B = C/4−0.5'},
      {n:3,en:'Shape & mori',deps:['B','C'],formula:'D = C/12 · E = mori (B/2)'},
      {n:4,en:'Armhole (cap)',deps:['A','D'],formula:`¼ A–D · I +0.5″ · J −0.4″ · ${capSplit}″ split`,man:true},
    ],
    dims:(pt,m,cur,sx,sy,SW,SH)=>{ let g='';
      if(cur>=2){ g+=dimH(sx(pt.B.x),sx(pt.A.x),sy(0)-16,`C/4−0.5 = ${fmt(m.C/4-0.5)}″`);
                  g+=dimV(sx(pt.A.x)+16,sy(0),sy(pt.C.y),`SL = ${fmt(m.SL)}″`); }
      if(cur===3){ g+=dimV(sx(pt.B.x)-32,sy(0),sy(pt.D.y),`C/12 = ${fmt(m.C/12)}″`);
                   g+=dimH(sx(pt.E.x),sx(pt.C.x),sy(pt.C.y)+30,`B/2 = ${fmt(m.Bm/2)}″`); }
      if(cur===4){ g+=`<text class="dimtxt" x="${sx(SW*0.62)}" y="${sy(SH*0.78)}" fill="var(--accent2)" text-anchor="middle">I +0.5″ · J −0.4″ · split ${capSplit}″</text>`; }
      return g; },
  };}

  const INSTR_SLEEVE = {
    1:{draft:(v)=>[
        `Take a sheet ${fmt(v.SL)}″ long and ${fmt(v.bicep*2)}″ wide.`,
        `Fold it in half lengthwise → ${fmt(v.SL)}″ × ${fmt(v.bicep)}″. The fold is the centre of the sleeve, with the straight grain down it.`,
        "As with the body, you draft on the folded half so the sleeve opens out symmetric."],
       sew:null,
       tip:()=>"Aligning the fold with the fabric grain keeps the sleeve hanging straight rather than twisting on the arm."},
    2:{draft:(v)=>[
        "Mark A at the top, on the fold — the peak of the sleeve cap.",
        `From A, measure ${fmt(v.SL)}″ (SL) straight down the fold and mark C, the sleeve hem on the fold.`,
        `From A, measure ${fmt(v.bicep)}″ (C/4−0.5) toward the open edge and mark B; this fixes the bicep width.`],
       sew:null,
       tip:(v)=>`${fmt(v.bicep)}″ = Chest ÷ 4 − 0.5. The −0.5 keeps the sleeve trim at the bicep instead of ballooning.`},
    3:{draft:(v)=>[
        `From B, measure ${fmt(v.cap)}″ (C/12) down and mark D — the underarm point where the sleeve meets the body.`,
        `From C, measure ${fmt(v.mori)}″ (B/2) toward the open edge and mark E — half the sleeve-hem (mori) width.`,
        "Join D–E; this straight line is the underarm seam of the sleeve."],
       sew:()=>"The underarm seam D–E is closed after the cap is eased into the armhole — usually in the same pass as the body side seam.",
       tip:()=>"Widen C→E for a looser, flared short sleeve; narrow it for a neat, fitted cap sleeve."},
    4:{draft:()=>[
        "Rule the straight line A–D and divide it into 4 equal parts, marking the three quarter points.",
        "At the upper quarter push the curve out +0.5″ (point I) for the rounded crown; at the lower quarter scoop it in −0.4″ (point J) for the underarm hollow.",
        "With a French curve, draw the S-shaped cap A → I → G → J → D — it meets the corner A itself, not the top edge.",
        "Draw it twice: the second pass runs deeper at J by the split shown on the diagram — that is the back cap.",
        "Measure along the finished cap — its length must equal the body armhole from Part 1, or the sleeve won't sit in cleanly."],
       sew:()=>"Ease the cap into the armhole: match the sleeve centre-top to the shoulder seam, spread the small extra length evenly, then stitch. Close the underarm and side seam in one line.",
       tip:()=>"Run long gathering stitches along the cap first — you can then draw the fullness in gently until the cap matches the armhole, with no puckers."},
  };

  return { makeSleeve, INSTR_SLEEVE };
});
