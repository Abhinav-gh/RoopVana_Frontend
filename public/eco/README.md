# SILAI object store

SILAI Studio (`public/silai-dag-studio.html`) keeps no drafting code of its own.
Every garment is an **Executable Craft Object (ECO)** in this folder, and the
studio retrieves the objects it needs at run time.

```
eco/
  manifest.json                 store index: id, kind, file, deps, sha256, bytes, provenance, match words
  lib/geometry.eco.js           curve maths shared by the programs (library)
  components/set-in-sleeve.eco.js   set-in sleeve, used by the kurta and the blouse (component)
  components/kurta-block.eco.js     kurti body block, sleeved and sleeveless (component)
  garments/<id>.eco.js          one drafting program per garment (garment)
```

## How retrieval works

1. The studio fetches `manifest.json`.
2. `SILAI.require(id)` fetches the object's file, checks its SHA-256 against the
   manifest (refusing it if they differ), runs it, and resolves its `deps` the
   same way. `kit` is built into the studio (fmt, V, dimH, dimV, crPath, LAB).
3. A garment object returns its descriptor (label, chart, measurements used,
   phases with steps, drawing and instructions, finished-garment preview),
   which is registered in `PARTS` and `CHARTS`.
4. The garment named in `?part=` is retrieved first; the rest are prefetched
   in the background so the switcher is instant.

`SILAI.lookup(text)` returns the garment whose `match` words best fit a
description (for example `SILAI.lookup('red lehenga')` returns `skirt`).

## Object format

```js
SILAI.define('<id>', ['kit', 'geometry'], function (kit, geo) {
  const { fmt, V, dimH, dimV, crPath } = kit;
  const PARTS = {};
  // ... drafting code ...
  PARTS.<id> = { label, tag, chart, uses, phases, garmentTitle, garment };
  const ECO = PARTS.<id>;
  ECO.id = '<id>';
  ECO.chartSizes = <SIZE CHART>;   // {small, medium, large}
  return ECO;
});
```

Each phase provides `name`, `steps`, `sheet(m)`, `points(m)`, `edges(pt, m)`,
`dims(...)` and `instr` (per-step `draft`, `sew`, `tip` functions of the live
measurements). All lengths are in inches.

## Correcting or adding a garment

1. Edit or add the `.eco.js` file. A new garment also needs a manifest entry
   (copy an existing one) and a `.sw-btn` button in the studio header.
2. Run `node scripts/update-eco-manifest.mjs` to refresh the hashes.
   `--check` only reports objects whose hash is out of date.
3. Open `/silai-dag-studio.html?part=<id>` and step through every step.

If the hash is not refreshed, the studio refuses the edited object and shows
"Pattern not loaded".
