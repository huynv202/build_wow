# Haven City 3D Asset Pipeline

## Current coverage

- 156 generated GLB assets in `assets/models`.
- All gameplay buildings have four or more model levels where their definitions allow upgrades.
- Residential buildings retain six house levels and five apartment levels.
- Additional sets include four parks, four wind turbines, sixteen defense/emergency assets, sixteen landmarks, eight street props, three vehicles, and six tree variants.
- Roads remain procedural because their shape depends on live grid connectivity; this avoids loading a separate GLB for every junction shape.
- Vehicles and street props are loaded only after roads or their related services exist. Cars, buses, fire engines, lights, signals, benches, bins, racks, hydrants, bollards, and planters all retain procedural fallbacks while their GLBs stream in.
- Repetitive support assets are instantiated from prepared `AssetContainer` objects and use distance culling; moving vehicles keep only their lightweight wrapper mesh mutable.

## Performance contract

Every generated model must pass `npm run models:audit` with:

- bottom-center pivot;
- PBR materials only;
- no node transform correction required at runtime;
- at most ten draw calls;
- fewer than 60,000 vertices;
- file size below 500 KB.

The current generated set uses no more than three draw calls per model. Colors are stored as normalized vertex colors so the models retain the reference palette without one material per color.

## Regeneration

Run:

```bash
npm run models:generate
npm run models:audit
npm run build
```

`scripts/generate-models.mjs` is the source of truth. Do not hand-edit generated GLB files.
