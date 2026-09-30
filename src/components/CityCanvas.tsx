import { useEffect, useRef, useState } from 'react'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { AssetContainer } from '@babylonjs/core/assetContainer'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Engine } from '@babylonjs/core/Engines/engine'
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem'
import { Scene } from '@babylonjs/core/scene'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import '@babylonjs/core/Collisions/collisionCoordinator'
import '@babylonjs/core/Culling/ray'
import '@babylonjs/loaders/glTF/2.0/glTFLoader'
import { BUILDING_MAP } from '../data/buildings'
import { instantiatePreparedAsset, prepareAssetContainer } from '../game/graphics/assetPipeline'
import { isModelBackedBuilding, resolveBuildingAsset, TREE_ASSET_KEYS } from '../game/graphics/assetRegistry'
import { configureIsometricPbrLighting } from '../game/graphics/lighting'
import type { GameState, GridPoint, Overlay, PlacementPlan, Tool } from '../types'

const GRID = 16, TILE = 3.2
const MATERIAL_CACHE = new WeakMap<Scene, Map<string, StandardMaterial>>()
interface Props { state: GameState; tool: Tool; overlay: Overlay; selected: string | null; planPlacement: (tiles: GridPoint[]) => PlacementPlan; onPlace: (tiles: GridPoint[]) => void; onPreview: (plan: PlacementPlan | null) => void; onCancel: () => void; onSelect: (id: string | null) => void }
interface CarRoute { axis: 'x' | 'z'; fixed: number; min: number; max: number; speed: number; offset: number }
interface ThreatMotion { kind: 'zombie' | 'monster' | 'epidemic'; angle: number; radius: number; speed: number; offset: number }
interface BuildInteraction { anchor: GridPoint | null; hover: GridPoint | null; tiles: GridPoint[]; dragging: boolean }
interface Runtime { scene: Scene; camera: ArcRotateCamera; ambient: HemisphericLight; sun: DirectionalLight; shadows: ShadowGenerator; cityRoot: TransformNode; previewRoot: TransformNode; rain: ParticleSystem; cars: Mesh[]; citizens: Mesh[]; threats: TransformNode[]; assets: Map<string, AssetContainer>; loading: Set<string>; modelsReady: boolean; modelLoadTimer: number | null; interaction: BuildInteraction }

export function CityCanvas(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null), runtime = useRef<Runtime | null>(null), latest = useRef(props)
  const [sceneReady, setSceneReady] = useState(false)
  latest.current = props
  useEffect(() => {
    const canvas = canvasRef.current!, engine = new Engine(canvas, true, { antialias: true, stencil: true })
    engine.setHardwareScalingLevel(Math.max(1, devicePixelRatio / 1.4))
    const scene = new Scene(engine)
    scene.collisionsEnabled = true
    scene.clearColor = new Color4(.48, .7, .69, 1); scene.fogMode = Scene.FOGMODE_EXP2; scene.fogDensity = .0045; scene.imageProcessingConfiguration.contrast = 1.12; scene.imageProcessingConfiguration.exposure = .92; scene.imageProcessingConfiguration.toneMappingEnabled = true
    const camera = new ArcRotateCamera('strategy-camera', -Math.PI / 4, .78, 33, new Vector3(0, 1.35, 0), scene)
    camera.attachControl(canvas, true); camera.lowerRadiusLimit = 18; camera.upperRadiusLimit = 82; camera.lowerBetaLimit = .42; camera.upperBetaLimit = 1.28; camera.wheelPrecision = 35; camera.panningSensibility = 75; camera.inertia = .82
    camera.checkCollisions = true; camera.collisionRadius = new Vector3(.8, .8, .8)
    const { ambient, sun, shadows } = configureIsometricPbrLighting(scene)
    new GlowLayer('city-glow', scene, { blurKernelSize: 32 }).intensity = .42
    const cityRoot = new TransformNode('city-root', scene), previewRoot = new TransformNode('build-preview-root', scene)
    const waterMat = material(scene, 'river', '#4d9caf', .86); waterMat.specularColor = new Color3(.65, .9, 1)
    const river = MeshBuilder.CreateGround('river', { width: 82, height: 27, subdivisions: 16 }, scene); river.position.set(0, -.18, -28); river.material = waterMat
    const land = MeshBuilder.CreateCylinder('island', { diameter: 64, height: 1.2, tessellation: 8 }, scene); land.scaling.z = .84; land.position.y = -.72; land.material = material(scene, 'island-soil', '#627e57'); land.receiveShadows = true; land.checkCollisions = true
    const rain = createRain(scene), cars: Mesh[] = [], citizens: Mesh[] = [], threats: Mesh[] = []
    runtime.current = { scene, camera, ambient, sun, shadows, cityRoot, previewRoot, rain, cars, citizens, threats, assets: new Map(), loading: new Set(), modelsReady: false, modelLoadTimer: null, interaction: { anchor: null, hover: null, tiles: [], dragging: false } }; rebuildCity(runtime.current, latest.current)
    let time = 0, qualityTimer = 0
    engine.runRenderLoop(() => {
      time += engine.getDeltaTime() / 1000; qualityTimer += engine.getDeltaTime()
      cars.forEach(car => moveAlongRoute(car, time))
      citizens.forEach((citizen, index) => { moveAlongRoute(citizen, time); citizen.position.y = .43 + Math.abs(Math.sin(time * 5 + index)) * .045 })
      threats.forEach(threat => animateThreat(threat, time))
      river.position.y = -.18 + Math.sin(time * .8) * .035; scene.render()
      if (qualityTimer > 4000) { qualityTimer = 0; const fps = engine.getFps(), scale = engine.getHardwareScalingLevel(); if (fps < 42 && scale < 2) engine.setHardwareScalingLevel(Math.min(2, scale + .15)); else if (fps > 57 && scale > 1) engine.setHardwareScalingLevel(Math.max(1, scale - .1)) }
    })
    const readyTimer = window.setTimeout(() => setSceneReady(true), 850)
    runtime.current.modelLoadTimer = window.setTimeout(() => {
      const active = runtime.current
      if (!active || active.scene !== scene) return
      active.modelsReady = true
      void ensureModels(active, latest.current).then(changed => { if (changed && runtime.current === active) rebuildCity(active, latest.current) })
    }, 180)
    const updateHover = (pick: ReturnType<Scene['pick']>) => {
      const active = runtime.current; if (!active) return
      const point = pick ? pickedTile(pick) : null
      if (point?.x === active.interaction.hover?.x && point?.y === active.interaction.hover?.y || !point && !active.interaction.hover) return
      active.interaction.hover = point
      if (latest.current.tool === 'inspect') return
      active.interaction.tiles = active.interaction.dragging && active.interaction.anchor && point ? selectionTiles(active.interaction.anchor, point, latest.current.tool) : point ? [point] : []
      refreshPlacementPreview(active, latest.current)
    }
    const updateAt = (clientX: number, clientY: number) => { const bounds = canvas.getBoundingClientRect(); updateHover(scene.pick(clientX - bounds.left, clientY - bounds.top)) }
    const pointerMove = (event: PointerEvent) => updateAt(event.clientX, event.clientY)
    const dragOver = (event: DragEvent) => { event.preventDefault(); if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'; updateAt(event.clientX, event.clientY) }
    const drop = (event: DragEvent) => {
      event.preventDefault(); updateAt(event.clientX, event.clientY)
      const active = runtime.current, current = latest.current
      if (active && current.tool !== 'inspect' && active.interaction.tiles.length) current.onPlace(active.interaction.tiles)
    }
    scene.onPointerDown = (event, pick) => {
      const active = runtime.current, current = latest.current; if (!active) return
      if (event.button === 2 && current.tool !== 'inspect') { clearPlacement(active, current); current.onCancel(); return }
      if (event.button !== 0 || !pick.hit || !pick.pickedMesh) return
      const data = pick.pickedMesh.metadata as { tile?: [number, number]; buildingId?: string } | null
      if (current.tool === 'inspect') { current.onSelect(data?.buildingId ?? null); return }
      if (!data?.tile) return
      const point = { x: data.tile[0], y: data.tile[1] }
      active.interaction.anchor = point; active.interaction.hover = point; active.interaction.dragging = true; active.interaction.tiles = [point]
      refreshPlacementPreview(active, current)
    }
    scene.onPointerUp = event => {
      const active = runtime.current, current = latest.current
      if (!active || event.button !== 0 || !active.interaction.dragging || current.tool === 'inspect') return
      const tiles = active.interaction.tiles
      active.interaction.dragging = false; active.interaction.anchor = null
      if (tiles.length) current.onPlace(tiles)
      active.interaction.tiles = active.interaction.hover ? [active.interaction.hover] : []
      refreshPlacementPreview(active, current)
    }
    const resize = () => engine.resize()
    const cancel = (event: KeyboardEvent) => { if (event.key === 'Escape' && latest.current.tool !== 'inspect' && runtime.current) { clearPlacement(runtime.current, latest.current); latest.current.onCancel() } }
    const preventContextMenu = (event: MouseEvent) => event.preventDefault()
    window.addEventListener('resize', resize); window.addEventListener('keydown', cancel); canvas.addEventListener('contextmenu', preventContextMenu); canvas.addEventListener('pointermove', pointerMove); canvas.addEventListener('dragover', dragOver); canvas.addEventListener('drop', drop)
    return () => { window.removeEventListener('resize', resize); window.removeEventListener('keydown', cancel); canvas.removeEventListener('contextmenu', preventContextMenu); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('dragover', dragOver); canvas.removeEventListener('drop', drop); window.clearTimeout(readyTimer); if (runtime.current?.scene === scene && runtime.current.modelLoadTimer !== null) window.clearTimeout(runtime.current.modelLoadTimer); scene.dispose(); engine.dispose(); runtime.current = null }
  }, [])
  useEffect(() => { if (runtime.current) { const active=runtime.current;rebuildCity(active,props);setCameraButtons(active,props.tool);refreshPlacementPreview(active,props);if(active.modelsReady)void ensureModels(active,props).then(changed=>{if(changed&&runtime.current===active)rebuildCity(active,latest.current)}) } }, [props.state.buildings, props.overlay, props.selected, props.tool, props.state.hour < 6 || props.state.hour > 18.8, Math.floor(props.state.stats.population / 10), props.state.disaster?.kind, props.state.disaster?.phase])
  useEffect(() => { if (runtime.current) updateAtmosphere(runtime.current, props.state) }, [props.state.hour, props.state.weather, props.state.disaster?.kind, props.state.disaster?.phase])
  return <div className={`city-canvas ${props.tool === 'inspect' ? 'camera-mode' : 'build-mode'}`}><canvas ref={canvasRef}/>{!sceneReady&&<div className="canvas-loading"><i/><span>Đang dựng thành phố</span></div>}<div className="engine-badge"><i/> BABYLON.JS · REALTIME 3D</div><div className="map-hint">{props.tool === 'inspect' ? 'Kéo để xoay · Chuột phải để di chuyển · Cuộn để thu phóng' : 'Giữ chuột trái và kéo để chọn · Esc hoặc chuột phải để hủy'}</div></div>
}

function pickedTile(pick: { hit: boolean; pickedMesh: { metadata: unknown } | null }): GridPoint | null {
  if (!pick.hit || !pick.pickedMesh) return null
  const data = pick.pickedMesh.metadata as { tile?: [number, number] } | null
  return data?.tile ? { x: data.tile[0], y: data.tile[1] } : null
}

function selectionTiles(anchor: GridPoint, current: GridPoint, tool: Tool) {
  const tiles: GridPoint[] = []
  if (tool === 'road') {
    if (Math.abs(current.x - anchor.x) >= Math.abs(current.y - anchor.y)) {
      for (let x = Math.min(anchor.x, current.x); x <= Math.max(anchor.x, current.x); x++) tiles.push({ x, y: anchor.y })
    } else for (let y = Math.min(anchor.y, current.y); y <= Math.max(anchor.y, current.y); y++) tiles.push({ x: anchor.x, y })
    return tiles
  }
  for (let x = Math.min(anchor.x, current.x); x <= Math.max(anchor.x, current.x); x++) for (let y = Math.min(anchor.y, current.y); y <= Math.max(anchor.y, current.y); y++) tiles.push({ x, y })
  return tiles
}

function refreshPlacementPreview(rt: Runtime, props: Props) {
  rt.previewRoot.getChildren().forEach(node => node.dispose())
  if (props.tool === 'inspect' || !rt.interaction.tiles.length) { props.onPreview(null); return }
  const plan = props.planPlacement(rt.interaction.tiles)
  const valid = new Set(plan.valid.map(point => `${point.x}:${point.y}`))
  const invalid = new Set(plan.invalid.map(point => `${point.x}:${point.y}`))
  rt.interaction.tiles.forEach(point => {
    const key = `${point.x}:${point.y}`, included = valid.has(key), accepted = !invalid.has(key) && plan.affordable, destructive = props.tool === 'bulldoze'
    const marker = MeshBuilder.CreateBox('placement-marker', { width: TILE - .12, depth: TILE - .12, height: .16 }, rt.scene)
    marker.parent = rt.previewRoot; marker.position.set(world(point.x), .2, world(point.y)); marker.isPickable = false
    marker.material = material(rt.scene, `preview-${accepted ? 'valid' : 'invalid'}`, accepted ? destructive ? '#e45f4f' : '#43d692' : '#df5548', .58)
    if (included && accepted && props.tool !== 'road' && props.tool !== 'bulldoze') {
      const definition = BUILDING_MAP[props.tool], height = Math.min(3.4, Math.max(.75, definition.height / 14))
      const ghost = MeshBuilder.CreateBox('placement-ghost', { width: 2.2, depth: 2.05, height }, rt.scene)
      ghost.parent = rt.previewRoot; ghost.position.set(world(point.x), height / 2 + .28, world(point.y)); ghost.isPickable = false
      ghost.material = material(rt.scene, 'preview-ghost', definition.color, .4)
    }
  })
  props.onPreview(plan)
}

function clearPlacement(rt: Runtime, props: Props) {
  rt.interaction = { anchor: null, hover: null, tiles: [], dragging: false }
  rt.previewRoot.getChildren().forEach(node => node.dispose())
  props.onPreview(null)
}

function setCameraButtons(rt: Runtime, tool: Tool) {
  const pointers = rt.camera.inputs.attached.pointers as unknown as { buttons: number[] } | undefined
  if (pointers) pointers.buttons = tool === 'inspect' ? [0, 1, 2] : [1, 2]
}

function rebuildCity(rt: Runtime, props: Props) {
  const { scene, cityRoot, shadows, cars, citizens, threats } = rt
  cityRoot.getChildMeshes().forEach(mesh => shadows.removeShadowCaster(mesh)); cityRoot.getChildren().forEach(node => node.dispose()); cars.splice(0); citizens.splice(0); threats.splice(0)
  const night = props.state.hour < 6 || props.state.hour > 18.8
  const lightsOn = night && !(props.state.disaster?.kind === 'blackout' && props.state.disaster.phase === 'active') && props.state.stats.power >= props.state.stats.powerUse
  updateAtmosphere(rt, props.state)
  const occupied = new Map(props.state.buildings.map(b => [`${b.x}:${b.y}`, b]))
  for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) {
    const building = occupied.get(`${x}:${y}`), tile = MeshBuilder.CreateBox(`tile-${x}-${y}`, { width: TILE + .025, depth: TILE + .025, height: .12 }, scene)
    tile.parent = cityRoot; tile.position.set(world(x), 0, world(y)); tile.metadata = { tile: [x, y], buildingId: building?.id }
    let tileColor = (x * 7 + y * 3) % 5 === 0 ? '#72a966' : '#79b06b'; if (props.overlay === 'flood') tileColor = x + y > 22 ? '#4e9eb4' : '#78a98b'; if (props.overlay === 'happiness') tileColor = '#62a96f'
    tile.material = material(scene, `ground-${x}-${y}`, tileColor); tile.receiveShadows = true
    if (!building) { if ((x * 13 + y * 7) % 17 === 0) createTree(scene, cityRoot, tile.position.add(new Vector3(.3, .12, -.25)), shadows, rt.assets); continue }
    if (building.type === 'road') createRoad(scene, cityRoot, x, y, occupied, tile, props, shadows, lightsOn); else createBuilding(scene, cityRoot, tile, building, props, shadows, lightsOn, rt.assets)
  }
  createTraffic(scene, cityRoot, cars, shadows, night, occupied)
  createPedestrians(scene, cityRoot, citizens, props.state, occupied)
  createThreatActors(scene, cityRoot, threats, props.state, shadows)
  cityRoot.getChildMeshes().forEach(mesh => { if(!mesh.name.startsWith('car-')&&!mesh.name.startsWith('citizen-')&&!mesh.name.startsWith('threat-')){mesh.computeWorldMatrix(true);mesh.freezeWorldMatrix()} })
}

function updateAtmosphere(rt: Runtime, state: GameState) {
  const night = state.hour < 6 || state.hour > 18.8, dusk = state.hour > 17 && state.hour <= 20
  const securityCrisis = state.disaster?.phase === 'active' && (state.disaster.kind === 'zombie' || state.disaster.kind === 'monster')
  rt.scene.clearColor = night ? securityCrisis ? new Color4(.09, .035, .055, 1) : new Color4(.035, .09, .15, 1) : dusk ? new Color4(.72, .45, .34, 1) : securityCrisis ? new Color4(.62, .69, .65, 1) : new Color4(.72, .86, .84, 1)
  rt.scene.fogColor = new Color3(rt.scene.clearColor.r, rt.scene.clearColor.g, rt.scene.clearColor.b)
  rt.ambient.intensity = night ? .32 : dusk ? .48 : .72
  rt.ambient.diffuse = night ? new Color3(.28, .42, .54) : new Color3(.86, .96, .92)
  rt.scene.imageProcessingConfiguration.exposure = night ? .8 : dusk ? .84 : .92
  rt.sun.intensity = night ? .14 : dusk ? .8 : 1.45
  rt.sun.diffuse = dusk ? new Color3(1, .58, .36) : new Color3(1, .94, .78)
  rt.rain.emitter = state.weather === 'Mưa' || state.weather === 'Mưa lớn' ? new Vector3(0, 25, 0) : null
  rt.rain.emitRate = state.weather === 'Mưa lớn' ? 2600 : 1000
}

function createBuilding(scene: Scene, root: TransformNode, tile: Mesh, placed: GameState['buildings'][number], props: Props, shadows: ShadowGenerator, lightsOn: boolean, assets: Map<string, AssetContainer>) {
  const def = BUILDING_MAP[placed.type], group = new TransformNode(`building-${placed.id}`, scene); group.id=placed.id;group.parent = root; group.position.copyFrom(tile.position); group.metadata = { tile: [placed.x, placed.y], buildingId: placed.id }
  const scale = 1 + (placed.level - 1) * .14; let color = def.color
  if (props.overlay === 'power') color = (def.power ?? 0) > 0 ? '#36d2a0' : props.state.stats.power >= props.state.stats.powerUse ? '#75c79e' : '#e14f45'
  if (props.overlay === 'water') color = (def.water ?? 0) > 0 ? '#29b8e3' : props.state.stats.water >= props.state.stats.waterUse ? '#7ac6d8' : '#e14f45'
  if (props.overlay === 'flood') color = (def.resilience ?? 0) >= 8 ? '#38bf94' : '#e18b55'
  const mat = material(scene, `facade-${placed.id}`, lighten(color, 12)), roofMat = material(scene, `roof-${placed.id}`, lighten(color, 38)), height = Math.max(.7, def.height / 10.5) * scale
  const assetProfile=resolveBuildingAsset(placed.type,placed.level),modelKey=assetProfile?.key??'',asset=modelKey?assets.get(modelKey):undefined
  if (asset) {
    instantiatePreparedAsset(asset,{id:`${placed.id}::collision`,name:placed.id,parent:group,assetScale:assetProfile!.scale,collisionFootprint:{width:assetProfile!.collisionWidth,depth:assetProfile!.collisionDepth},collisionEnabled:true,isPickable:true,metadata:group.metadata,shadowGenerator:shadows,lod:{detailDistance:assetProfile!.detailDistance,cullDistance:assetProfile!.cullDistance}})
    if (lightsOn) {
      group.computeWorldMatrix(true);group.getChildMeshes().forEach(mesh=>mesh.computeWorldMatrix(true))
      const bounds=group.getHierarchyBoundingVectors(true),halfX=Math.min(1.48,Math.max(.72,(bounds.max.x-bounds.min.x)/2)),halfZ=Math.min(1.48,Math.max(.72,(bounds.max.z-bounds.min.z)/2))
      createNightFacadeLights(scene,root,tile.position,def.height,placed.level,['market','office','supermarket','hotel','mixed_use'].includes(placed.type),{halfX,halfZ,minY:bounds.min.y,maxY:bounds.max.y})
    }
    createProtectionField(scene, root, tile.position, placed.type, props.state)
    if (placed.id === props.selected) { const ring=MeshBuilder.CreateTorus('selection',{diameter:3.3/Math.max(group.scaling.x,.01),thickness:.08/Math.max(group.scaling.x,.01),tessellation:40},scene);ring.parent=group;ring.position.y=.25;const rm=material(scene,'selection-mat','#ffe178');rm.emissiveColor=new Color3(1,.65,.12);ring.material=rm }
    return
  }
  if (placed.type === 'park') createPark(scene, group, shadows, assets)
  else if (placed.type === 'water') { const legs = MeshBuilder.CreateCylinder('tower-leg', { diameter: .32, height: 3.4 }, scene); legs.parent=group; legs.position.y=1.8; legs.material=mat; const tank=MeshBuilder.CreateSphere('water-tank',{diameter:2.35,segments:18},scene);tank.parent=group;tank.scaling.y=.72;tank.position.y=4;tank.material=mat;tank.metadata=group.metadata;shadows.addShadowCaster(tank) }
  else if (placed.type === 'solar') for(let px=-1;px<=1;px++) for(let pz=-1;pz<=1;pz++){const panel=MeshBuilder.CreateBox('solar-panel',{width:.78,height:.08,depth:.65},scene);panel.parent=group;panel.position.set(px*.85,.55,pz*.72);panel.rotation.x=.28;panel.material=material(scene,'solar-glass','#174e69');panel.metadata=group.metadata}
  else if (placed.type === 'drain') { const pump=MeshBuilder.CreateCylinder('pump',{diameter:2.1,height:.7,tessellation:16},scene);pump.parent=group;pump.position.y=.46;pump.material=mat;pump.metadata=group.metadata; const pipe=MeshBuilder.CreateTorus('pipe',{diameter:1.35,thickness:.2,tessellation:20},scene);pipe.parent=group;pipe.position.y=1.1;pipe.rotation.x=Math.PI/2;pipe.material=roofMat;pipe.metadata=group.metadata }
  else if (['shelter', 'security_hub', 'research_lab', 'defense_tower'].includes(placed.type)) createDefenseBuilding(scene, group, placed, mat, roofMat, shadows)
  else { const lowRise=['house','market','clinic','fire','school'].includes(placed.type), width=lowRise?2.55:2.15, depth=lowRise?2.35:2.05; const body=MeshBuilder.CreateBox('building-body',{width,depth,height},scene);body.parent=group;body.position.y=height/2+.14;body.material=mat;body.metadata=group.metadata;shadows.addShadowCaster(body); const roof=MeshBuilder.CreateCylinder('building-roof',{diameter:Math.max(width,depth)+.35,height:.35,tessellation:4},scene);roof.parent=group;roof.rotation.y=Math.PI/4;roof.position.y=height+.26;roof.scaling.z=.86;roof.material=roofMat;roof.metadata=group.metadata;shadows.addShadowCaster(roof); const wm=material(scene,`windows-${placed.id}`,lightsOn?'#ffd77d':'#a9dfe3');wm.emissiveColor=lightsOn?new Color3(.72,.44,.12):new Color3(.03,.08,.08); for(let floor=.72;floor<height;floor+=.72){for(const side of [-1,1]){const front=MeshBuilder.CreatePlane('window',{width:width*.46,height:.24},scene);front.parent=group;front.position.set(0,floor,side*(depth/2+.006));front.rotation.y=side<0?Math.PI:0;front.material=wm;front.metadata=group.metadata;const flank=MeshBuilder.CreatePlane('window-side',{width:depth*.42,height:.24},scene);flank.parent=group;flank.position.set(side*(width/2+.006),floor,0);flank.rotation.y=side>0?Math.PI/2:-Math.PI/2;flank.material=wm;flank.metadata=group.metadata}} const band=MeshBuilder.CreateBox('facade-band',{width:width+.05,depth:depth+.05,height:.1},scene);band.parent=group;band.position.y=Math.min(height-.15,.62);band.material=roofMat;band.metadata=group.metadata }
  const collision=MeshBuilder.CreateBox(`${placed.id}::collision`,{width:TILE*.84,depth:TILE*.84,height:Math.max(.5,height)},scene);collision.parent=group;collision.position.y=Math.max(.5,height)/2;collision.visibility=0;collision.isPickable=false;collision.checkCollisions=true;collision.metadata=group.metadata
  if (lightsOn && ['shelter', 'security_hub', 'research_lab', 'defense_tower'].includes(placed.type)) createNightFacadeLights(scene, root, tile.position, def.height, placed.level, false)
  createProtectionField(scene, root, tile.position, placed.type, props.state)
  if (placed.id === props.selected) { const ring=MeshBuilder.CreateTorus('selection',{diameter:3.3,thickness:.08,tessellation:40},scene);ring.parent=group;ring.position.y=.25;const rm=material(scene,'selection-mat','#ffe178');rm.emissiveColor=new Color3(1,.65,.12);ring.material=rm }
}

function createRoad(scene: Scene, root: TransformNode, x: number, y: number, occupied: Map<string, GameState['buildings'][number]>, tile: Mesh, props: Props, shadows: ShadowGenerator, lightsOn: boolean) {
  const road=occupied.get(`${x}:${y}`),level=road?.level??1,left=occupied.get(`${x-1}:${y}`)?.type==='road',right=occupied.get(`${x+1}:${y}`)?.type==='road',up=occupied.get(`${x}:${y-1}`)?.type==='road',down=occupied.get(`${x}:${y+1}`)?.type==='road',horizontal=left||right,vertical=up||down,intersection=horizontal&&vertical
  tile.material=material(scene,`asphalt-${level}`,['#4b5755','#414d4c','#344745','#283d40'][level-1])
  if(!intersection){
    const line=MeshBuilder.CreateBox('road-line',{width:horizontal?TILE*.72:.08,depth:horizontal?.08:TILE*.72,height:.025},scene);line.parent=root;line.position.set(tile.position.x,.135,tile.position.z);line.material=material(scene,'lane-mark',level>=4?'#68c8d1':'#e7d58a');line.metadata=tile.metadata
    for(const side of [-1,1]){const curb=MeshBuilder.CreateBox('road-curb',{width:horizontal?TILE:.13,depth:horizontal?.13:TILE,height:level>=2?.12:.08},scene);curb.parent=root;curb.position.set(tile.position.x+(horizontal?0:side*(TILE/2-.07)),.16,tile.position.z+(horizontal?side*(TILE/2-.07):0));curb.material=material(scene,'curb',level>=3?'#c4cec5':'#a9b8ae')}
    if(level>=3)for(const side of [-1,1]){const lane=MeshBuilder.CreateBox('transit-lane',{width:horizontal?TILE*.92:.055,depth:horizontal?.055:TILE*.92,height:.028},scene);lane.parent=root;lane.position.set(tile.position.x+(horizontal?0:side*.78),.15,tile.position.z+(horizontal?side*.78:0));lane.material=material(scene,'transit-mark',level>=4?'#e85f5a':'#48aaa0')}
  } else if(level>=2){for(let i=-2;i<=2;i++){const stripe=MeshBuilder.CreateBox('crosswalk',{width:.14,depth:.74,height:.03},scene);stripe.parent=root;stripe.position.set(tile.position.x+i*.28,.15,tile.position.z+1.08);stripe.material=material(scene,'crosswalk-mat','#e8ece4');const stripe2=stripe.clone('crosswalk-side');stripe2.position.set(tile.position.x+1.08,.15,tile.position.z+i*.28);stripe2.rotation.y=Math.PI/2}}
  if((x+y)%2===0)createStreetLight(scene,root,tile.position.add(new Vector3(horizontal?1.25:-1.25,.14,horizontal?-1.25:1.25)),shadows,lightsOn)
  if(level>=4&&(x*7+y*3)%9===0)createRoadGantry(scene,root,tile.position,horizontal,shadows)
  if(props.selected===road?.id){const s=MeshBuilder.CreateBox('road-select',{width:TILE-.15,depth:TILE-.15,height:.04},scene);s.parent=root;s.position.set(tile.position.x,.17,tile.position.z);s.material=material(scene,'road-selection','#ffe178',.45)}
}

function createDefenseBuilding(scene:Scene,group:TransformNode,placed:GameState['buildings'][number],bodyMat:StandardMaterial,accentMat:StandardMaterial,shadows:ShadowGenerator){
  const meta=group.metadata,scale=1+(placed.level-1)*.12
  if(placed.type==='shelter'){
    const bunker=MeshBuilder.CreateBox('shelter-bunker',{width:2.65,depth:2.35,height:.72*scale},scene);bunker.parent=group;bunker.position.y=.5;bunker.material=bodyMat;bunker.metadata=meta;shadows.addShadowCaster(bunker)
    const hatch=MeshBuilder.CreateCylinder('shelter-hatch',{diameter:1.05,height:.22,tessellation:10},scene);hatch.parent=group;hatch.position.y=.98;hatch.material=accentMat;hatch.metadata=meta
  }else if(placed.type==='security_hub'){
    const hub=MeshBuilder.CreateBox('security-hub',{width:2.55,depth:2.3,height:1.35*scale},scene);hub.parent=group;hub.position.y=.82;hub.material=bodyMat;hub.metadata=meta;shadows.addShadowCaster(hub)
    const mast=MeshBuilder.CreateCylinder('security-mast',{diameter:.11,height:1.6,tessellation:7},scene);mast.parent=group;mast.position.y=2.15*scale;mast.material=accentMat
    const radar=MeshBuilder.CreateTorus('security-radar',{diameter:.85,thickness:.09,tessellation:18},scene);radar.parent=group;radar.position.y=2.75*scale;radar.rotation.x=Math.PI/2;radar.material=accentMat
  }else if(placed.type==='research_lab'){
    const lab=MeshBuilder.CreateCylinder('research-lab',{diameter:2.65,height:1.25*scale,tessellation:12},scene);lab.parent=group;lab.position.y=.76;lab.material=bodyMat;lab.metadata=meta;shadows.addShadowCaster(lab)
    const dome=MeshBuilder.CreateSphere('research-dome',{diameter:1.65,segments:14},scene);dome.parent=group;dome.scaling.y=.58;dome.position.y=1.55*scale;dome.material=accentMat;dome.metadata=meta
    const antenna=MeshBuilder.CreateCylinder('research-antenna',{diameter:.08,height:1.15,tessellation:6},scene);antenna.parent=group;antenna.position.y=2.35*scale;antenna.material=accentMat
  }else{
    const tower=MeshBuilder.CreateCylinder('defense-tower',{diameter:1.15,height:3.8*scale,tessellation:10},scene);tower.parent=group;tower.position.y=2;tower.material=bodyMat;tower.metadata=meta;shadows.addShadowCaster(tower)
    const crown=MeshBuilder.CreateBox('defense-crown',{width:2.1,depth:1.45,height:.62},scene);crown.parent=group;crown.position.y=4*scale;crown.material=accentMat;crown.metadata=meta;shadows.addShadowCaster(crown)
    const emitter=MeshBuilder.CreateCylinder('defense-emitter',{diameter:.36,height:1.4,tessellation:8},scene);emitter.parent=group;emitter.position.y=4.85*scale;emitter.material=material(scene,'defense-energy','#67e2df');(emitter.material as StandardMaterial).emissiveColor=new Color3(.08,.75,.72)
  }
}

function createNightFacadeLights(scene:Scene,root:TransformNode,position:Vector3,definitionHeight:number,level:number,commercial:boolean,bounds?:{halfX:number;halfZ:number;minY:number;maxY:number}){
  const lightRoot=new TransformNode('night-facade-lights',scene);lightRoot.parent=root;lightRoot.position.copyFrom(position)
  const glow=material(scene,'night-window-glow','#ffd978');glow.emissiveColor=new Color3(1,.58,.12);glow.disableLighting=true
  const floors=Math.min(3,Math.max(1,Math.round(definitionHeight/28)+(level>2?1:0))),bottom=bounds?Math.max(.48,bounds.minY-position.y+.42):.72,top=bounds?Math.max(bottom,Math.min(bounds.maxY-position.y-.32,bottom+3.4)):Math.min(4.2,Math.max(1.05,definitionHeight/14)),halfX=bounds?.halfX??1.25,halfZ=bounds?.halfZ??1.25
  for(let floor=0;floor<floors;floor++){
    const y=bottom+(top-bottom)*(floor/Math.max(1,floors-1))
    for(const side of [-1,1])for(const column of [-1,1]){
      const front=MeshBuilder.CreateBox('night-window',{width:.34,height:.25,depth:.045},scene);front.parent=lightRoot;front.position.set(column*halfX*.36,y,side*(halfZ+.035));front.material=glow;front.isPickable=false
      const flank=MeshBuilder.CreateBox('night-window',{width:.045,height:.25,depth:.34},scene);flank.parent=lightRoot;flank.position.set(side*(halfX+.035),y,column*halfZ*.36);flank.material=glow;flank.isPickable=false
    }
  }
  const spill=MeshBuilder.CreateDisc('night-building-spill',{radius:Math.max(1.25,Math.min(1.8,Math.max(halfX,halfZ)*1.25)),tessellation:24},scene);spill.parent=lightRoot;spill.position.y=.15;spill.rotation.x=Math.PI/2;spill.material=material(scene,'night-building-spill','#ffc85c',.1);spill.isPickable=false
  if(commercial){const sign=MeshBuilder.CreateBox('night-sign',{width:Math.min(1.35,halfX*1.15),height:.26,depth:.05},scene);sign.parent=lightRoot;sign.position.set(0,bottom*.78,halfZ+.06);const signMat=material(scene,'night-sign-glow','#56e5d0');signMat.emissiveColor=new Color3(.05,.8,.67);signMat.disableLighting=true;sign.material=signMat;sign.isPickable=false}
}

function createProtectionField(scene:Scene,root:TransformNode,position:Vector3,type:string,state:GameState){
  const disaster=state.disaster
  if(!disaster||disaster.phase!=='active')return
  const responders:Partial<Record<NonNullable<GameState['disaster']>['kind'],string[]>>={
    flood:['drain','park'],uv:['uv_station'],storm:['fire','substation'],wave:['seawall','marina'],epidemic:['clinic','hospital','research_lab'],blackout:['substation','solar'],zombie:['police','clinic','hospital','shelter','security_hub'],monster:['defense_tower','research_lab','security_hub','police'],
  }
  if(!responders[disaster.kind]?.includes(type))return
  const ring=MeshBuilder.CreateTorus('protection-field',{diameter:2.9,thickness:.055,tessellation:32},scene);ring.parent=root;ring.position.copyFrom(position);ring.position.y=.23;ring.scaling.z=.72;ring.isPickable=false
  const shield=material(scene,`protection-${disaster.kind}`,disaster.kind==='zombie'?'#ff765d':'#5cf1dc',.72);shield.emissiveColor=disaster.kind==='zombie'?new Color3(.85,.12,.04):new Color3(.05,.8,.72);shield.disableLighting=true;ring.material=shield
}

function createPark(scene: Scene, root: TransformNode, shadows: ShadowGenerator, assets: Map<string, AssetContainer>){for(let i=0;i<4;i++)createTree(scene,root,new Vector3((i%2-.5)*1.25,.15,(Math.floor(i/2)-.5)*1.25),shadows,assets)}
function createTree(scene: Scene, root: TransformNode, position: Vector3, shadows: ShadowGenerator, assets: Map<string, AssetContainer>){const tree=new TransformNode('tree',scene);tree.parent=root;tree.position.copyFrom(position);const index=Math.abs(Math.round(position.x*3+position.z*5))%TREE_ASSET_KEYS.length,asset=assets.get(TREE_ASSET_KEYS[index]);if(asset){instantiatePreparedAsset(asset,{id:`tree-${index}-${position.x.toFixed(1)}-${position.z.toFixed(1)}`,parent:tree,assetScale:.36,collisionEnabled:false,isPickable:false,shadowGenerator:shadows,lod:{detailDistance:42,cullDistance:58}});return}const trunk=MeshBuilder.CreateCylinder('trunk',{diameter:.18,height:.75,tessellation:7},scene);trunk.parent=tree;trunk.position.y=.38;trunk.material=material(scene,'trunk-mat','#74513a');const crown=MeshBuilder.CreatePolyhedron('crown',{type:2,size:.72},scene);crown.parent=tree;crown.position.y=1.12;crown.scaling.y=1.25;crown.material=material(scene,'leaf-mat',(Math.round(position.x+position.z)&1)?'#397d52':'#58a366');shadows.addShadowCaster(crown)}
function createStreetLight(scene:Scene,root:TransformNode,position:Vector3,shadows:ShadowGenerator,lightsOn:boolean){const pole=MeshBuilder.CreateCylinder('street-light',{diameter:.07,height:1.65,tessellation:7},scene);pole.parent=root;pole.position.copyFrom(position);pole.position.y+=.82;pole.material=material(scene,'lamp-pole','#405a56');const lamp=MeshBuilder.CreateSphere('street-lamp',{diameter:.32,segments:8},scene);lamp.parent=root;lamp.position.copyFrom(position);lamp.position.y+=1.68;const lm=material(scene,lightsOn?'lamp-lit':'lamp-off',lightsOn?'#ffe8a2':'#86958d');lm.emissiveColor=lightsOn?new Color3(1,.68,.2):new Color3(0,0,0);lamp.material=lm;if(lightsOn){const pool=MeshBuilder.CreateDisc('street-light-pool',{radius:1.35,tessellation:24},scene);pool.parent=root;pool.position.copyFrom(position);pool.position.y=.17;pool.rotation.x=Math.PI/2;pool.material=material(scene,'lamp-pool','#ffd978',.24);pool.isPickable=false}shadows.addShadowCaster(pole)}
function createRoadGantry(scene:Scene,root:TransformNode,position:Vector3,horizontal:boolean,shadows:ShadowGenerator){const gantry=new TransformNode('road-gantry',scene);gantry.parent=root;gantry.position.copyFrom(position);if(!horizontal)gantry.rotation.y=Math.PI/2;for(const x of [-1.18,1.18]){const pole=MeshBuilder.CreateCylinder('gantry-pole',{diameter:.075,height:1.8,tessellation:7},scene);pole.parent=gantry;pole.position.set(x,1.02,0);pole.material=material(scene,'gantry-steel','#4c6666');shadows.addShadowCaster(pole)}const beam=MeshBuilder.CreateBox('gantry-beam',{width:2.55,height:.1,depth:.1},scene);beam.parent=gantry;beam.position.y=1.88;beam.material=material(scene,'gantry-steel','#4c6666');const sensor=MeshBuilder.CreateBox('gantry-sensor',{width:.75,height:.28,depth:.18},scene);sensor.parent=gantry;sensor.position.y=1.72;sensor.material=material(scene,'gantry-display','#54b8bc')}
function createTraffic(scene: Scene, root: TransformNode, cars: Mesh[], shadows: ShadowGenerator, night:boolean,occupied:Map<string,GameState['buildings'][number]>){const routes:CarRoute[]=[];for(let y=0;y<GRID;y++){const xs=Array.from({length:GRID},(_,x)=>x).filter(x=>occupied.get(`${x}:${y}`)?.type==='road');if(xs.length>=5)routes.push({axis:'x',fixed:world(y)+.42,min:world(Math.min(...xs))-.8,max:world(Math.max(...xs))+.8,speed:1.8+routes.length*.18,offset:routes.length*4.7})}for(let x=0;x<GRID;x++){const ys=Array.from({length:GRID},(_,y)=>y).filter(y=>occupied.get(`${x}:${y}`)?.type==='road');if(ys.length>=5)routes.push({axis:'z',fixed:world(x)-.42,min:world(Math.min(...ys))-.8,max:world(Math.max(...ys))+.8,speed:1.65+routes.length*.16,offset:routes.length*5.3})}routes.slice(0,8).forEach((route,i)=>{const car=MeshBuilder.CreateBox(`car-${i}`,{width:route.axis==='x'?1.02:.5,height:.32,depth:route.axis==='x'?.5:1.02},scene);car.parent=root;car.position.y=.4;car.material=material(scene,`car-mat-${i}`,['#e85f4d','#eab54f','#e6ede6','#378294'][i%4]);car.metadata={route};const cabin=MeshBuilder.CreateBox('car-cabin',{width:route.axis==='x'?.48:.42,height:.24,depth:route.axis==='x'?.4:.48},scene);cabin.parent=car;cabina(car,cabin,route);cabin.material=material(scene,'car-window','#75b9c3');shadows.addShadowCaster(car);cars.push(car);if(night){const light=MeshBuilder.CreateSphere('headlight',{diameter:.12},scene);light.parent=car;light.position.set(route.axis==='x'?.5:.16,.02,route.axis==='x'?.16:.5);const lm=material(scene,'headlight-mat','#fff4b2');lm.emissiveColor=new Color3(1,.7,.2);light.material=lm}})}
function createPedestrians(scene:Scene,root:TransformNode,citizens:Mesh[],state:GameState,occupied:Map<string,GameState['buildings'][number]>){
  const routes:CarRoute[]=[]
  for(let y=0;y<GRID;y++){const xs=Array.from({length:GRID},(_,x)=>x).filter(x=>occupied.get(`${x}:${y}`)?.type==='road');if(xs.length>=3)routes.push({axis:'x',fixed:world(y)+1.16,min:world(Math.min(...xs)),max:world(Math.max(...xs)),speed:.42+routes.length*.03,offset:routes.length*2.7})}
  for(let x=0;x<GRID;x++){const ys=Array.from({length:GRID},(_,y)=>y).filter(y=>occupied.get(`${x}:${y}`)?.type==='road');if(ys.length>=3)routes.push({axis:'z',fixed:world(x)-1.16,min:world(Math.min(...ys)),max:world(Math.max(...ys)),speed:.38+routes.length*.03,offset:routes.length*2.2})}
  if(!routes.length)return
  const night=state.hour<6||state.hour>18.8,securityEmergency=state.disaster?.phase==='active'&&(state.disaster.kind==='zombie'||state.disaster.kind==='monster'),count=Math.min(20,Math.max(3,Math.round(state.stats.population/6))) * (night ? 0.6 : 1) * (securityEmergency ? .3 : 1)
  for(let i=0;i<Math.round(count);i++){
    const route={...routes[i%routes.length],offset:routes[i%routes.length].offset+i*1.8,fixed:routes[i%routes.length].fixed+(i%2?-.18:.18)}
    const citizen=MeshBuilder.CreateCapsule(`citizen-${i}`,{height:.62,radius:.13,tessellation:6,subdivisions:1},scene);citizen.parent=root;citizen.material=material(scene,`citizen-clothes-${i}`,['#e47759','#e8b955','#4a8b9d','#eee4d4','#6d7fb1'][i%5]);citizen.metadata={route};citizen.isPickable=false;citizen.rotation.z=route.axis==='x'?Math.PI/2:0;citizens.push(citizen)
  }
}
function createThreatActors(scene:Scene,root:TransformNode,threats:TransformNode[],state:GameState,shadows:ShadowGenerator){
  const disaster=state.disaster;if(!disaster||disaster.phase==='recovery')return
  if(disaster.kind==='zombie'){
    const count=disaster.phase==='active'?14:5
    for(let i=0;i<count;i++){const actor=MeshBuilder.CreateCapsule(`threat-zombie-${i}`,{height:.72,radius:.16,tessellation:6,subdivisions:1},scene);actor.parent=root;actor.material=material(scene,'threat-zombie-mat',i%3?'#6e9a55':'#a5554f');actor.metadata={motion:{kind:'zombie',angle:i/count*Math.PI*2,radius:22+(i%4)*1.8,speed:.36+(i%3)*.08,offset:i*1.7} satisfies ThreatMotion};actor.isPickable=false;shadows.addShadowCaster(actor);threats.push(actor)}
  }else if(disaster.kind==='monster'){
    const actor=new TransformNode('threat-monster',scene);actor.parent=root;actor.metadata={motion:{kind:'monster',angle:.6,radius:21,speed:.08,offset:0} satisfies ThreatMotion}
    const hide=material(scene,'threat-monster-hide','#683f49'),armor=material(scene,'threat-monster-armor','#3d2832'),eye=material(scene,'threat-monster-eye','#ff5a39');hide.emissiveColor=new Color3(.12,.015,.025);eye.emissiveColor=new Color3(1,.08,.01);eye.disableLighting=true
    const body=MeshBuilder.CreateCapsule('threat-monster-body',{height:4.6,radius:1.15,tessellation:10,subdivisions:2},scene);body.parent=actor;body.position.y=2.25;body.scaling.z=1.3;body.material=hide
    const head=MeshBuilder.CreatePolyhedron('threat-monster-head',{type:2,size:1.3},scene);head.parent=actor;head.position.set(0,4.45,.38);head.scaling.set(1.05,.86,1.18);head.material=armor
    for(const side of [-1,1]){
      const arm=MeshBuilder.CreateCapsule('threat-monster-arm',{height:3,radius:.34,tessellation:7,subdivisions:1},scene);arm.parent=actor;arm.position.set(side*1.2,2.35,.05);arm.rotation.z=side*.38;arm.material=hide
      const leg=MeshBuilder.CreateCapsule('threat-monster-leg',{height:2.5,radius:.42,tessellation:7,subdivisions:1},scene);leg.parent=actor;leg.position.set(side*.58,.75,0);leg.rotation.z=side*.1;leg.material=armor
      const horn=MeshBuilder.CreateCylinder('threat-monster-horn',{diameterTop:0,diameterBottom:.34,height:1.25,tessellation:7},scene);horn.parent=actor;horn.position.set(side*.58,5.35,.2);horn.rotation.z=side*.36;horn.material=armor
      const glowingEye=MeshBuilder.CreateSphere('threat-monster-eye',{diameter:.18,segments:7},scene);glowingEye.parent=actor;glowingEye.position.set(side*.38,4.58,1.08);glowingEye.material=eye
    }
    const tail=MeshBuilder.CreateCylinder('threat-monster-tail',{diameterTop:.12,diameterBottom:.58,height:3.4,tessellation:8},scene);tail.parent=actor;tail.position.set(0,1.9,-2);tail.rotation.x=-1.05;tail.material=hide
    actor.getChildMeshes().forEach(mesh=>{mesh.isPickable=false;shadows.addShadowCaster(mesh)});threats.push(actor)
  }else if(disaster.kind==='epidemic'){
    const homes=state.buildings.filter(building=>['house','apartment','mixed_use'].includes(building.type)).slice(0,10)
    homes.forEach((home,i)=>{const cloud=MeshBuilder.CreateSphere(`threat-epidemic-${i}`,{diameter:.55,segments:8},scene);cloud.parent=root;cloud.position.set(world(home.x)+(i%2?.5:-.5),1.5,world(home.y));cloud.material=material(scene,'threat-epidemic-mat','#c36db1',.48);cloud.metadata={motion:{kind:'epidemic',angle:0,radius:0,speed:1,offset:i} satisfies ThreatMotion};cloud.isPickable=false;threats.push(cloud)})
  }
}
function moveAlongRoute(mesh:Mesh,time:number){const route=mesh.metadata?.route as CarRoute|undefined;if(!route)return;const span=Math.max(.1,route.max-route.min),value=route.min+((time*route.speed+route.offset)%span);if(route.axis==='x'){mesh.position.x=value;mesh.position.z=route.fixed}else{mesh.position.z=value;mesh.position.x=route.fixed}}
function animateThreat(mesh:TransformNode,time:number){const motion=mesh.metadata?.motion as ThreatMotion|undefined;if(!motion)return;if(motion.kind==='epidemic'){mesh.position.y=1.45+Math.sin(time*2+motion.offset)*.22;mesh.scaling.setAll(.85+Math.sin(time*1.5+motion.offset)*.12);return}if(motion.kind==='monster'){const radius=motion.radius-Math.min(8,(time*motion.speed)%9);mesh.position.set(Math.cos(motion.angle+time*.04)*radius,Math.abs(Math.sin(time*2.2))*.12,Math.sin(motion.angle+time*.04)*radius);mesh.rotation.y=-motion.angle-time*.04+Math.PI/2;return}const radius=Math.max(6,motion.radius-((time*motion.speed+motion.offset)%15));mesh.position.set(Math.cos(motion.angle)*radius,.48,Math.sin(motion.angle)*radius);mesh.rotation.y=-motion.angle+Math.PI/2}
function cabina(car:Mesh,cabin:Mesh,route:CarRoute){cabin.position.y=.26;if(route.axis==='z')car.rotation.y=Math.PI/2}
function createRain(scene:Scene){const ps=new ParticleSystem('rain',5000,scene);ps.particleTexture=new Texture('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="2" height="16"%3E%3Cpath stroke="%23dff7ff" d="M1 0v16"/%3E%3C/svg%3E',scene);ps.minEmitBox=new Vector3(-35,0,-35);ps.maxEmitBox=new Vector3(35,0,35);ps.color1=new Color4(.7,.9,1,.65);ps.minSize=.08;ps.maxSize=.15;ps.minLifeTime=.5;ps.maxLifeTime=1;ps.gravity=new Vector3(-3,-38,1);ps.start();ps.emitter=null;return ps}
async function ensureModels(rt:Runtime,props:Props){const buildingModels=props.state.buildings.filter(building=>isModelBackedBuilding(building.type)).map(building=>resolveBuildingAsset(building.type,building.level)!.key),names=[...new Set([...TREE_ASSET_KEYS,...buildingModels])],missing=names.filter(name=>!rt.assets.has(name)&&!rt.loading.has(name));if(!missing.length)return false;missing.forEach(name=>rt.loading.add(name));let changed=false;for(let index=0;index<missing.length;index+=2){await Promise.all(missing.slice(index,index+2).map(async name=>{try{const container=await SceneLoader.LoadAssetContainerAsync('/models/',`${name}.glb`,rt.scene);rt.assets.set(name,prepareAssetContainer(container));changed=true}catch(error){console.warn(`Unable to load ${name}: ${String(error)}`)}finally{rt.loading.delete(name)}}));await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()))}return changed}
function material(scene:Scene,name:string,hex:string,alpha=1){let cache=MATERIAL_CACHE.get(scene);if(!cache){cache=new Map();MATERIAL_CACHE.set(scene,cache)}const family=name.split('-')[0],key=`${family}:${hex}:${alpha}`;const existing=cache.get(key);if(existing)return existing;const mat=new StandardMaterial(key,scene);mat.diffuseColor=Color3.FromHexString(hex);mat.alpha=alpha;mat.specularColor=new Color3(.08,.11,.1);cache.set(key,mat);return mat}
function world(value:number){return (value-(GRID-1)/2)*TILE}
function lighten(hex:string,amount:number){const n=parseInt(hex.slice(1),16),r=Math.min(255,(n>>16)+amount),g=Math.min(255,(n>>8&255)+amount),b=Math.min(255,(n&255)+amount);return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`}
