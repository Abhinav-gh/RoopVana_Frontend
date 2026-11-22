/* SILAI Executable Craft Object
   id      : geometry
   kind    : library
   deps    : kit
   source  : SILAI
   note    : Bezier evaluation, arc-length sampling, quarter-round French curves
   This file is served from the SILAI object store (eco/manifest.json). The studio
   fetches it, checks its SHA-256 against the manifest, then runs the factory below.
   The drafting code inside is unchanged from the single-file studio. */
SILAI.define('geometry', ["kit"], function (kit) {
  const { fmt, V, dimH, dimV, crPath } = kit;

  function bezAt(p0,c1,c2,p3,t){ const u=1-t;
    return {x:u*u*u*p0.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*p3.x,
            y:u*u*u*p0.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*p3.y}; }
  // 7.8 · the "most slanted point" — where a curve leans furthest from its chord
  function maxLean(p0,c1,c2,p3){ const dx=p3.x-p0.x, dy=p3.y-p0.y, L=Math.hypot(dx,dy)||1;
    let best={d:-1,p:p0};
    for(let i=1;i<200;i++){ const t=i/200, q=bezAt(p0,c1,c2,p3,t);
      const d=Math.abs((q.x-p0.x)*dy-(q.y-p0.y)*dx)/L;
      if(d>best.d) best={d,p:q}; }
    return best.p; }
  function fmt2(p){return `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;}
  // exact circle→cubic constant: a quarter-round drawn with a French / hip curve
  const KAPPA = 4/3*(Math.SQRT2-1);          // 0.5522847…
  const f2 = (n)=>Number(n).toFixed(2);
  // quarter-round: leaves `a` vertically, arrives at `b` horizontally
  function qCtrl(a,b){ return [{x:a.x, y:a.y+KAPPA*(b.y-a.y)}, {x:b.x+KAPPA*(a.x-b.x), y:b.y}]; }
  function qCurve(a,b){ const c=qCtrl(a,b);
    return `M ${f2(a.x)} ${f2(a.y)} C ${f2(c[0].x)} ${f2(c[0].y)} ${f2(c[1].x)} ${f2(c[1].y)} ${f2(b.x)} ${f2(b.y)}`; }
  // hip curve between two points that both sit on a vertical run: vertical tangent
  // at each end, so it degenerates to a true straight line when the x's agree
  function vCurve(a,b){ const dy=(b.y-a.y)*0.5;
    return `M ${f2(a.x)} ${f2(a.y)} C ${f2(a.x)} ${f2(a.y+dy)} ${f2(b.x)} ${f2(b.y-dy)} ${f2(b.x)} ${f2(b.y)}`; }
  const lin = (a,b)=>[{x:a.x+(b.x-a.x)/3,y:a.y+(b.y-a.y)/3},{x:a.x+2*(b.x-a.x)/3,y:a.y+2*(b.y-a.y)/3}];
  const skUnit=(v)=>{ const l=Math.hypot(v.x,v.y)||1; return {x:v.x/l,y:v.y/l}; };
  // sample a cubic by arc length, so points can be placed a true distance along it
  function skArc(p0,c1,c2,p3,n){ const pts=[], s=[0];
    for(let i=0;i<=n;i++) pts.push(bezAt(p0,c1,c2,p3,i/n));
    for(let i=1;i<=n;i++) s.push(s[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y));
    return {pts,s,len:s[n]}; }
  function skAtLen(arc,L){ const {pts,s}=arc; let i=1; while(i<s.length-1 && s[i]<L) i++;
    const t=(L-s[i-1])/((s[i]-s[i-1])||1);
    return {x:pts[i-1].x+t*(pts[i].x-pts[i-1].x), y:pts[i-1].y+t*(pts[i].y-pts[i-1].y),
            tx:pts[i].x-pts[i-1].x, ty:pts[i].y-pts[i-1].y}; }

  return { bezAt, maxLean, fmt2, KAPPA, f2, qCtrl, qCurve, vCurve, lin, skUnit, skArc, skAtLen };
});
