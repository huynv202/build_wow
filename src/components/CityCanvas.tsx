import { useEffect, useRef } from 'react'
import { ArcRotateCamera, Color3, Color4, DirectionalLight, Engine, GlowLayer, HemisphericLight, Mesh, MeshBuilder, ParticleSystem, Scene, ShadowGenerator, StandardMaterial, Texture, TransformNode, Vector3 } from '@babylonjs/core'
import { BUILDING_MAP } from '../data/buildings'
import type { GameState, Overlay, Tool } from '../types'

const GRID = 18, TILE = 3.2
interface Props { state: GameState; tool: Tool; overlay: Overlay; selected: string | null; onTile: (x: number, y: number) => void; onSelect: (id: string | null) => void }
interface Runtime { scene: Scene; sun: DirectionalLight; shadows: ShadowGenerator; cityRoot: TransformNode; rain: ParticleSystem; cars: Mesh[] }

export function CityCanvas(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null), runtime = useRef<Runtime | null>(null), latest = useRef(props)
  latest.current = props
  useEffect(() => {
    const canvas = canvasRef.current!, engine = new Engine(canvas, true, { antialias: true, stencil: true })
    engine.setHardwareScalingLevel(Math.max(1, devicePixelRatio / 1.4))
    const scene = new Scene(engine)
    scene.clearColor = new Color4(.72, .86, .84, 1); scene.fogMode = Scene.FOGMODE_EXP2; scene.fogDensity = .006; scene.imageProcessingConfiguration.contrast = 1.18
    const camera = new ArcRotateCamera('strategy-camera', -Math.PI / 4, 1.02, 55, Vector3.Zero(), scene)
    camera.attachControl(canvas, true); camera.lowerRadiusLimit = 18; camera.upperRadiusLimit = 82; camera.lowerBetaLimit = .42; camera.upperBetaLimit = 1.28; camera.wheelPrecision = 35; camera.panningSensibility = 75; camera.inertia = .82
    const ambient = new HemisphericLight('ambient', new Vector3(.2, 1, .1), scene)
    ambient.intensity = .72; ambient.diffuse = new Color3(.78, .9, .85); ambient.groundColor = new Color3(.2, .33, .28)
    const sun = new DirectionalLight('sun', new Vector3(-.65, -1, -.45), scene); sun.position = new Vector3(30, 45, 28); sun.intensity = 1.45
    const shadows = new ShadowGenerator(2048, sun); shadows.usePercentageCloserFiltering = true; shadows.bias = .001
    new GlowLayer('city-glow', scene, { blurKernelSize: 32 }).intensity = .42
    const cityRoot = new TransformNode('city-root', scene)
    const waterMat = material(scene, 'river', '#4d9caf', .86); waterMat.specularColor = new Color3(.65, .9, 1)
    const river = MeshBuilder.CreateGround('river', { width: 90, height: 24, subdivisions: 16 }, scene); river.position.set(0, -.18, -36); river.material = waterMat
    const land = MeshBuilder.CreateCylinder('island', { diameter: 82, height: 1.2, tessellation: 8 }, scene); land.scaling.z = .78; land.position.y = -.72; land.material = material(scene, 'island-soil', '#78956d'); land.receiveShadows = true
    const rain = createRain(scene), cars: Mesh[] = []
    runtime.current = { scene, sun, shadows, cityRoot, rain, cars }; rebuildCity(runtime.current, latest.current)
    let time = 0
    engine.runRenderLoop(() => { time += engine.getDeltaTime() / 1000; cars.forEach((car, i) => { const lane = i % 3; car.position.x = ((time * (2.3 + lane * .35) + i * 11) % 46) - 23; car.position.z = (lane - 1) * TILE + .54 }); river.position.y = -.18 + Math.sin(time * .8) * .035; scene.render() })
    scene.onPointerDown = (_, pick) => { if (!pick.hit || !pick.pickedMesh) return; const data = pick.pickedMesh.metadata as { tile?: [number, number]; buildingId?: string } | null; const current = latest.current; if (current.tool === 'inspect') current.onSelect(data?.buildingId ?? null); else if (data?.tile) current.onTile(...data.tile) }
    const resize = () => engine.resize(); window.addEventListener('resize', resize)
    return () => { window.removeEventListener('resize', resize); scene.dispose(); engine.dispose(); runtime.current = null }
  }, [])
  useEffect(() => { if (runtime.current) rebuildCity(runtime.current, props) }, [props.state.buildings, props.overlay, props.selected])
  useEffect(() => { if (runtime.current) updateAtmosphere(runtime.current, props.state) }, [props.state.hour, props.state.weather])
  return <div className="city-canvas"><canvas ref={canvasRef}/><div className="engine-badge"><i/> BABYLON.JS · REALTIME 3D</div><div className="map-hint">Kéo để xoay · Chuột phải để di chuyển · Cuộn để thu phóng</div></div>
}

function rebuildCity(rt: Runtime, props: Props) {
  const { scene, cityRoot, shadows, cars } = rt
  cityRoot.getChildMeshes().forEach(mesh => { shadows.removeShadowCaster(mesh); mesh.dispose() }); cars.splice(0)
  const night = props.state.hour < 6 || props.state.hour > 18.8
  updateAtmosphere(rt, props.state)
  const occupied = new Map(props.state.buildings.map(b => [`${b.x}:${b.y}`, b]))
  for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) {
    const building = occupied.get(`${x}:${y}`), tile = MeshBuilder.CreateBox(`tile-${x}-${y}`, { width: TILE - .06, depth: TILE - .06, height: .22 }, scene)
    tile.parent = cityRoot; tile.position.set(world(x), 0, world(y)); tile.metadata = { tile: [x, y], buildingId: building?.id }
    let tileColor = (x + y) % 3 === 0 ? '#82aa75' : '#8db27b'; if (props.overlay === 'flood') tileColor = x + y > 22 ? '#66a9bd' : '#93b59a'; if (props.overlay === 'happiness') tileColor = '#71b980'
    tile.material = material(scene, `ground-${x}-${y}`, tileColor); tile.receiveShadows = true
    if (!building) { if ((x * 13 + y * 7) % 17 === 0) createTree(scene, cityRoot, tile.position.add(new Vector3(.3, .12, -.25)), shadows); continue }
    if (building.type === 'road') createRoad(scene, cityRoot, x, y, occupied, tile, props); else createBuilding(scene, cityRoot, tile, building, props, shadows, night)
  }
  createTraffic(scene, cityRoot, cars, shadows, night)
}

function updateAtmosphere(rt: Runtime, state: GameState) {
  const night = state.hour < 6 || state.hour > 18.8, dusk = state.hour > 17 && state.hour <= 20
  rt.scene.clearColor = night ? new Color4(.035, .09, .15, 1) : dusk ? new Color4(.72, .45, .34, 1) : new Color4(.72, .86, .84, 1)
  rt.scene.fogColor = new Color3(rt.scene.clearColor.r, rt.scene.clearColor.g, rt.scene.clearColor.b)
  rt.sun.intensity = night ? .18 : dusk ? .8 : 1.45
  rt.sun.diffuse = dusk ? new Color3(1, .58, .36) : new Color3(1, .94, .78)
  rt.rain.emitter = state.weather === 'Mưa' || state.weather === 'Mưa lớn' ? new Vector3(0, 25, 0) : null
  rt.rain.emitRate = state.weather === 'Mưa lớn' ? 2600 : 1000
}

function createBuilding(scene: Scene, root: TransformNode, tile: Mesh, placed: GameState['buildings'][number], props: Props, shadows: ShadowGenerator, night: boolean) {
  const def = BUILDING_MAP[placed.type], group = new TransformNode(`building-${placed.id}`, scene); group.parent = root; group.position.copyFrom(tile.position); group.metadata = { tile: [placed.x, placed.y], buildingId: placed.id }
  const scale = 1 + (placed.level - 1) * .14; let color = def.color
  if (props.overlay === 'power') color = (def.power ?? 0) > 0 ? '#36d2a0' : props.state.stats.power >= props.state.stats.powerUse ? '#75c79e' : '#e14f45'
  if (props.overlay === 'water') color = (def.water ?? 0) > 0 ? '#29b8e3' : props.state.stats.water >= props.state.stats.waterUse ? '#7ac6d8' : '#e14f45'
  if (props.overlay === 'flood') color = (def.resilience ?? 0) >= 8 ? '#38bf94' : '#e18b55'
  const mat = material(scene, `facade-${placed.id}`, color), roofMat = material(scene, `roof-${placed.id}`, lighten(color, 28)), height = Math.max(.7, def.height / 9) * scale
  if (placed.type === 'park') createPark(scene, group, shadows)
  else if (placed.type === 'water') { const legs = MeshBuilder.CreateCylinder('tower-leg', { diameter: .32, height: 3.4 }, scene); legs.parent=group; legs.position.y=1.8; legs.material=mat; const tank=MeshBuilder.CreateSphere('water-tank',{diameter:2.35,segments:18},scene);tank.parent=group;tank.scaling.y=.72;tank.position.y=4;tank.material=mat;tank.metadata=group.metadata;shadows.addShadowCaster(tank) }
  else if (placed.type === 'solar') for(let px=-1;px<=1;px++) for(let pz=-1;pz<=1;pz++){const panel=MeshBuilder.CreateBox('solar-panel',{width:.78,height:.08,depth:.65},scene);panel.parent=group;panel.position.set(px*.85,.55,pz*.72);panel.rotation.x=.28;panel.material=material(scene,'solar-glass','#174e69');panel.metadata=group.metadata}
  else if (placed.type === 'drain') { const pump=MeshBuilder.CreateCylinder('pump',{diameter:2.1,height:.7,tessellation:16},scene);pump.parent=group;pump.position.y=.46;pump.material=mat;pump.metadata=group.metadata; const pipe=MeshBuilder.CreateTorus('pipe',{diameter:1.35,thickness:.2,tessellation:20},scene);pipe.parent=group;pipe.position.y=1.1;pipe.rotation.x=Math.PI/2;pipe.material=roofMat;pipe.metadata=group.metadata }
  else { const body=MeshBuilder.CreateBox('building-body',{width:2.15,depth:2.05,height},scene);body.parent=group;body.position.y=height/2+.14;body.material=mat;body.metadata=group.metadata;shadows.addShadowCaster(body); const roof=MeshBuilder.CreateCylinder('building-roof',{diameter:2.52,height:.35,tessellation:4},scene);roof.parent=group;roof.rotation.y=Math.PI/4;roof.position.y=height+.26;roof.scaling.z=.86;roof.material=roofMat;roof.metadata=group.metadata;shadows.addShadowCaster(roof); const wm=material(scene,`windows-${placed.id}`,night?'#ffd77d':'#b7e4dd');wm.emissiveColor=night?new Color3(.72,.44,.12):new Color3(.04,.1,.1); for(let floor=.75;floor<height;floor+=.8) for(const side of [-1,1]){const win=MeshBuilder.CreatePlane('window',{width:.85,height:.28},scene);win.parent=group;win.position.set(0,floor,side*1.031);win.rotation.y=side<0?Math.PI:0;win.material=wm;win.metadata=group.metadata} }
  if (placed.id === props.selected) { const ring=MeshBuilder.CreateTorus('selection',{diameter:3.3,thickness:.08,tessellation:40},scene);ring.parent=group;ring.position.y=.25;const rm=material(scene,'selection-mat','#ffe178');rm.emissiveColor=new Color3(1,.65,.12);ring.material=rm }
}

function createRoad(scene: Scene, root: TransformNode, x: number, y: number, occupied: Map<string, GameState['buildings'][number]>, tile: Mesh, props: Props) { tile.material = material(scene, `asphalt-${x}-${y}`, '#53615f'); const horizontal = occupied.get(`${x-1}:${y}`)?.type === 'road' || occupied.get(`${x+1}:${y}`)?.type === 'road'; const line=MeshBuilder.CreateBox('road-line',{width:horizontal?TILE*.82:.09,depth:horizontal?.09:TILE*.82,height:.025},scene);line.parent=root;line.position.set(tile.position.x,.135,tile.position.z);line.material=material(scene,'lane-mark','#e9cf79');line.metadata=tile.metadata; if(props.selected===occupied.get(`${x}:${y}`)?.id){const s=MeshBuilder.CreateBox('road-select',{width:TILE-.15,depth:TILE-.15,height:.04},scene);s.parent=root;s.position.set(tile.position.x,.17,tile.position.z);s.material=material(scene,'road-selection','#ffe178',.45)} }
function createPark(scene: Scene, root: TransformNode, shadows: ShadowGenerator){for(let i=0;i<4;i++)createTree(scene,root,new Vector3((i%2-.5)*1.25,.15,(Math.floor(i/2)-.5)*1.25),shadows)}
function createTree(scene: Scene, root: TransformNode, position: Vector3, shadows: ShadowGenerator){const tree=new TransformNode('tree',scene);tree.parent=root;tree.position.copyFrom(position);const trunk=MeshBuilder.CreateCylinder('trunk',{diameter:.18,height:.75,tessellation:7},scene);trunk.parent=tree;trunk.position.y=.38;trunk.material=material(scene,'trunk-mat','#74513a');const crown=MeshBuilder.CreatePolyhedron('crown',{type:2,size:.72},scene);crown.parent=tree;crown.position.y=1.12;crown.scaling.y=1.25;crown.material=material(scene,'leaf-mat',Math.random()>.5?'#3f8558':'#529665');shadows.addShadowCaster(crown)}
function createTraffic(scene: Scene, root: TransformNode, cars: Mesh[], shadows: ShadowGenerator, night:boolean){for(let i=0;i<7;i++){const car=MeshBuilder.CreateBox(`car-${i}`,{width:1.05,height:.38,depth:.52},scene);car.parent=root;car.position.y=.42;car.material=material(scene,`car-mat-${i}`,['#e85f4d','#eab54f','#e6ede6','#428b9b'][i%4]);shadows.addShadowCaster(car);cars.push(car);if(night){const light=MeshBuilder.CreateSphere('headlight',{diameter:.13},scene);light.parent=car;light.position.set(.52,0,-.16);const lm=material(scene,'headlight-mat','#fff4b2');lm.emissiveColor=new Color3(1,.7,.2);light.material=lm}}}
function createRain(scene:Scene){const ps=new ParticleSystem('rain',5000,scene);ps.particleTexture=new Texture('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="2" height="16"%3E%3Cpath stroke="%23dff7ff" d="M1 0v16"/%3E%3C/svg%3E',scene);ps.minEmitBox=new Vector3(-35,0,-35);ps.maxEmitBox=new Vector3(35,0,35);ps.color1=new Color4(.7,.9,1,.65);ps.minSize=.08;ps.maxSize=.15;ps.minLifeTime=.5;ps.maxLifeTime=1;ps.gravity=new Vector3(-3,-38,1);ps.start();ps.emitter=null;return ps}
function material(scene:Scene,name:string,hex:string,alpha=1){const mat=new StandardMaterial(name,scene);mat.diffuseColor=Color3.FromHexString(hex);mat.alpha=alpha;mat.specularColor=new Color3(.08,.11,.1);return mat}
function world(value:number){return (value-(GRID-1)/2)*TILE}
function lighten(hex:string,amount:number){const n=parseInt(hex.slice(1),16),r=Math.min(255,(n>>16)+amount),g=Math.min(255,(n>>8&255)+amount),b=Math.min(255,(n&255)+amount);return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`}
