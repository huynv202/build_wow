# Haven City Graphics Upgrade Pipeline

Target style: **Stylized Low-Poly Isometric with clean warm PBR materials**. The silhouettes remain readable from the strategy camera while albedo, normal and metallic/roughness maps provide modern material response.

## 1. Asset audit and compatibility mapping

Run `npm run models:audit` whenever a GLB is added or replaced. The report is generated at `assets/models/asset-audit.json` and `docs/asset-audit.md`.

Current inventory:

- 105 GLB assets, 10.35 MiB total.
- All current materials expose glTF PBR metallic/roughness data.
- 37 assets have a source pivot that is not reliably bottom-center. Runtime normalization now repairs this automatically.
- 50 assets exceed ten material primitives/draw calls. New external assets should use an atlas and stay below eight material slots where possible.

The compatibility root is an invisible Babylon mesh with the exact legacy ID and transform. Imported visuals are moved beneath it and offset so `(0, 0, 0)` is always the bottom-center anchor. A simple box proxy owns `checkCollisions = true`; detailed render meshes do not run expensive per-triangle collision tests.

Legacy type-to-file mapping lives in `src/game/graphics/assetRegistry.ts`. Replacing an asset only requires preserving the mapped filename, or changing its registry entry. Save data continues to use the old building type and grid coordinates.

Asset contract:

```text
file:               <legacy_type>_lv<level>.glb
root orientation:   +Y up, +Z forward
runtime anchor:     bottom-center
tile footprint:     <= 2.69 x 2.69 world units on a 3.2 unit tile
materials:          glTF PBR metallic/roughness
textures:           albedo sRGB; normal/ORM linear; max 2048 for hero assets
collision:          generated proxy, never detailed render geometry
node identity:      compatibility root keeps the legacy id/name
```

For a one-off legacy mesh swap:

```ts
const replacement = await importLegacyReplacement(scene, legacyMesh, {
  rootUrl: '/models/',
  fileName: 'hospital_lv4.glb',
  scale: .292,
  collisionFootprint: { width: 2.69, depth: 2.69 },
})
```

## 2. WebGL 2 and PBR material path

`prepareAssetContainer` upgrades old `StandardMaterial` inputs to `PBRMaterial`, preserves albedo, bump and emissive textures, and applies stable roughness/metallic defaults. Native glTF PBR materials remain intact and are frozen after loading.

`configureIsometricPbrLighting` creates:

- one hemispheric fill light;
- one directional sun;
- a 1024px WebGL 2 shadow map using medium-quality PCF;
- automatic shadow Z bounds, normal bias and reduced darkness for stable isometric shadows.

The 1024px PCF setup is intentionally preferred over the old 2048px map because it reduces fill-rate and mobile memory pressure without visibly degrading the current camera distance.

## 3. Automated grid replacement

The batch API accepts the legacy tilemap shape and keeps IDs and grid positions stable. The current 16x16 map uses a centered origin, so its projection is explicit rather than silently changing coordinates:

```ts
await batchReplaceLegacyGrid(
  scene,
  legacyPlacements,
  preparedContainers,
  TILE_SIZE,
  cityRoot,
  {
    originX: -((GRID_COLUMNS - 1) * TILE_SIZE) / 2,
    originZ: -((GRID_ROWS - 1) * TILE_SIZE) / 2,
  },
)
```

Each placement receives a bottom-center compatibility root, metadata with the original grid coordinates, and a collision proxy. Custom or staggered isometric maps can supply `toWorld(placement, tileSize)` without changing saved grid data. Containers are cached once, while `instantiateModelsToScene` reuses geometry and materials for repeated assets.

The live renderer loads only asset families present in the current save, two GLBs at a time. A procedural fallback city renders first, preventing a blank frame while GLB parsing is in progress.

## 4. Performance and memory rules

- Cache one `AssetContainer` per asset key; never call `ImportMeshAsync` for every copy of the same building.
- Use container instancing for buildings and trees. Materials and geometry remain shared.
- Decorative material meshes are culled at 46 world units; full buildings at 86. Trees use 42/58 distance thresholds. Terminal null-LOD is registered on the shared source mesh, so every `InstancedMesh` inherits the same distance policy without duplicating geometry.
- Keep collision on one low-poly proxy per building. Imported child meshes use `checkCollisions = false`.
- Freeze static world matrices after city rebuild and keep moving cars, citizens and threats unfrozen.
- Load GLBs in batches of two and yield one animation frame between batches.
- Use adaptive hardware scaling when FPS drops below 42; recover quality above 57 FPS.
- Keep the Babylon renderer lazy-loaded so the menu does not pay the WebGL bundle cost.
- Dispose placed instance roots during rebuild; keep source containers alive until the scene is disposed.

Recommended budgets for future assets:

| Asset class | Triangles | Materials | Texture maximum | LOD/cull |
| --- | ---: | ---: | ---: | ---: |
| Tree/prop | 500-1,500 | 1-2 | 512 | 42/58 |
| House/shop | 3,000-8,000 | 3-6 | 1024 | 46/86 |
| Landmark/service | 8,000-20,000 | 4-8 | 2048 | 55/95 |

Any asset that fails the audit remains usable because runtime pivot normalization is defensive, but it should not be promoted to the production asset pack until pivot and draw-call warnings are resolved.
