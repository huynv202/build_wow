import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mkdir, writeFile } from 'node:fs/promises'

globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(value => { this.result = value; this.onloadend?.() }) }
  readAsDataURL(blob) { blob.arrayBuffer().then(value => { this.result = `data:${blob.type};base64,${Buffer.from(value).toString('base64')}`; this.onloadend?.() }) }
}

const palette = {
  ivory: 0xf0eee3, white: 0xdde8e3, coral: 0xee755e, terracotta: 0xd85f4c,
  teal: 0x2b9290, turquoise: 0x55c3bb, glass: 0x5bb9c3, glassDark: 0x327b8d,
  wood: 0xa96f45, dark: 0x244945, green: 0x4e9d62, foliage: 0x75b964,
  concrete: 0xaeb8b1, pavement: 0x7f908c, gold: 0xe6b34f, yellow: 0xf0cc58,
  brick: 0xb96051, red: 0xc84f43, blue: 0x3f7fb3, steel: 0x778d91,
  water: 0x45aebe, solar: 0x205e83, soil: 0x806b54, pink: 0xe788aa,
  asphalt: 0x394544, rail: 0x505e60, sand: 0xd7c596,
}

const materials = {
  rough: new THREE.MeshStandardMaterial({ name: 'surface_rough', color: 0xffffff, vertexColors: true, roughness: .74, metalness: .02 }),
  glossy: new THREE.MeshStandardMaterial({ name: 'surface_glossy', color: 0xffffff, vertexColors: true, roughness: .28, metalness: .04 }),
  metallic: new THREE.MeshStandardMaterial({ name: 'surface_metallic', color: 0xffffff, vertexColors: true, roughness: .38, metalness: .28 }),
}

function materialClass(kind) {
  if (['glass', 'glassDark', 'water'].includes(kind)) return 'glossy'
  if (['steel', 'solar', 'rail'].includes(kind)) return 'metallic'
  return 'rough'
}

function gableRoof(width, depth, height) {
  const w = width / 2, d = depth / 2
  const vertices = new Float32Array([-w,0,-d, w,0,-d, 0,height,-d, -w,0,d, w,0,d, 0,height,d])
  const indices = [0,1,2, 3,5,4, 0,3,4, 0,4,1, 2,1,4, 2,4,5, 0,2,5, 0,5,3]
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals()
  return geometry
}

function modelBuilder() {
  const buckets = new Map()
  const add = (kind, source, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) => {
    let geometry = source.clone()
    if (geometry.index) geometry = geometry.toNonIndexed()
    geometry.deleteAttribute('uv'); geometry.deleteAttribute('uv1')
    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(...scale),
    )
    geometry.applyMatrix4(matrix)
    const list = buckets.get(kind) ?? []; list.push(geometry); buckets.set(kind, list)
  }
  const box = (kind, size, position, rotation = [0, 0, 0]) => add(kind, new THREE.BoxGeometry(...size), position, [1, 1, 1], rotation)
  const cylinder = (kind, radius, height, position, sides = 12, radiusTop = radius, rotation = [0, 0, 0]) => add(kind, new THREE.CylinderGeometry(radiusTop, radius, height, sides), position, [1, 1, 1], rotation)
  const sphere = (kind, radius, position, width = 12, height = 8, scale = [1, 1, 1]) => add(kind, new THREE.SphereGeometry(radius, width, height), position, scale)
  const torus = (kind, radius, tube, position, rotation = [0, 0, 0], sides = 12) => add(kind, new THREE.TorusGeometry(radius, tube, 6, sides), position, [1, 1, 1], rotation)
  const roof = (width, depth, height, y, kind = 'coral', positionX = 0, positionZ = 0) => add(kind, gableRoof(width, depth, height), [positionX, y, positionZ])
  const beam = (kind, start, end, radius = .06, sides = 6) => {
    const a = new THREE.Vector3(...start), d = new THREE.Vector3(...end).sub(a), center = a.clone().addScaledVector(d, .5)
    const geometry = new THREE.CylinderGeometry(radius, radius, d.length(), sides)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())
    geometry.applyMatrix4(new THREE.Matrix4().compose(center, quaternion, new THREE.Vector3(1, 1, 1)))
    const prepared = geometry.toNonIndexed(); prepared.deleteAttribute('uv'); prepared.deleteAttribute('uv1')
    const list = buckets.get(kind) ?? []; list.push(prepared); buckets.set(kind, list)
  }
  const frontWindows = (width, depth, floorYs, columns, kind = 'glass', inset = .04) => {
    const cell = width / columns
    for (const y of floorYs) for (let i = 0; i < columns; i++) {
      const x = -width / 2 + cell * (i + .5)
      box(kind, [cell * .57, .42, .1], [x, y, depth / 2 + inset])
      box(kind, [cell * .57, .42, .1], [x, y, -depth / 2 - inset])
      box('dark', [cell * .68, .05, .12], [x, y - .25, depth / 2 + inset - .01])
      box('dark', [cell * .68, .05, .12], [x, y - .25, -depth / 2 - inset + .01])
    }
  }
  const sideWindows = (width, depth, floorYs, columns, kind = 'glass') => {
    const cell = depth / columns
    for (const side of [-1, 1]) for (const y of floorYs) for (let i = 0; i < columns; i++) { const z = -depth / 2 + cell * (i + .5); box(kind, [.1, .42, cell * .56], [side * (width / 2 + .04), y, z]) }
  }
  const balcony = (width, y, z, x = 0, accent = 'white') => {
    box(accent, [width, .12, .82], [x, y, z])
    box('glassDark', [width - .18, .38, .06], [x, y + .23, z + .38])
    for (const px of [-width / 2 + .14, width / 2 - .14]) box('steel', [.06, .43, .06], [x + px, y + .22, z + .38])
  }
  const tree = (x, z, size = 1) => {
    cylinder('wood', .11 * size, .72 * size, [x, .38 * size, z], 7)
    sphere('green', .45 * size, [x, .92 * size, z], 8, 5, [1, 1.2, 1])
    sphere('foliage', .34 * size, [x + .22 * size, 1.13 * size, z - .12 * size], 8, 5)
  }
  const planter = (x, y, z, width = .65) => { box('wood', [width, .22, .3], [x, y, z]); sphere('green', .22, [x, y + .24, z], 7, 4, [1.25, .7, .8]) }
  const stairs = (width, z, steps = 3) => { for (let i = 0; i < steps; i++) box('concrete', [width, .12 * (i + 1), .34], [0, .06 * (i + 1), z + i * .26]) }
  const solarPanel = (x, y, z, scale = 1, rotationY = 0) => {
    box('steel', [.06, .52 * scale, .06], [x, y - .23 * scale, z], [0, 0, -.2])
    box('solar', [1.2 * scale, .08, .82 * scale], [x, y, z], [-.28, rotationY, 0])
    box('white', [.04, .1, .82 * scale], [x, y + .015, z], [-.28, rotationY, 0])
  }
  const finish = () => {
    const group = new THREE.Group(); group.name = 'asset'
    const prepared = [], bounds = new THREE.Box3()
    for (const [kind, geometries] of buckets) {
      const merged = mergeGeometries(geometries, false); merged.computeVertexNormals(); merged.computeBoundingBox()
      if (merged.boundingBox) bounds.union(merged.boundingBox)
      prepared.push({ kind, geometry: merged })
    }
    const centerX = (bounds.min.x + bounds.max.x) / 2, centerZ = (bounds.min.z + bounds.max.z) / 2
    const renderBuckets = new Map()
    for (const { kind, geometry } of prepared) {
      geometry.translate(-centerX, -bounds.min.y, -centerZ)
      const color = new THREE.Color(palette[kind]), count = geometry.getAttribute('position').count, values = new Uint8Array(count * 3)
      for (let index = 0; index < count; index++) { values[index * 3] = Math.round(color.r * 255); values[index * 3 + 1] = Math.round(color.g * 255); values[index * 3 + 2] = Math.round(color.b * 255) }
      geometry.setAttribute('color', new THREE.Uint8BufferAttribute(values, 3, true))
      const bucket = materialClass(kind), list = renderBuckets.get(bucket) ?? []; list.push(geometry); renderBuckets.set(bucket, list)
    }
    for (const [kind, geometries] of renderBuckets) {
      const merged = mergeGeometries(geometries, false); merged.computeVertexNormals()
      const mesh = new THREE.Mesh(merged, materials[kind]); mesh.name = kind; mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh)
    }
    return group
  }
  return { add, box, cylinder, sphere, torus, roof, beam, frontWindows, sideWindows, balcony, tree, planter, stairs, solarPanel, finish }
}

function baseLot(b, width = 9.5, depth = 8.7) {
  b.box('pavement', [width, .22, depth], [0, .11, 0])
  b.box('concrete', [width - .35, .08, depth - .35], [0, .26, 0])
}

function createHouse(level) {
  const b = modelBuilder(); baseLot(b, 9.4, 8.5)
  if (level === 1) {
    b.box('ivory', [6.2, 2.6, 4.7], [0, 1.58, -.35]); b.roof(6.9, 5.35, 1.65, 2.88, 'coral', 0, -.35)
    b.box('teal', [1.05, 1.65, .12], [0, 1.22, 2.06]); b.box('glass', [1.45, .9, .12], [-2, 1.55, 2.06]); b.box('glass', [1.45, .9, .12], [2, 1.55, 2.06])
    b.box('wood', [7.2, .16, 1.05], [0, 2.56, 2.3]); for (const x of [-3.2, 3.2]) b.box('wood', [.14, 2.1, .14], [x, 1.48, 2.3])
  } else if (level === 2) {
    b.box('ivory', [5.3, 2.7, 4.8], [-1.55, 1.62, -.35]); b.roof(5.9, 5.35, 1.55, 2.97, 'coral', -1.55, -.35)
    b.box('white', [2.5, 2.35, 3.6], [2.3, 1.45, .25]); b.roof(2.95, 4.05, 1.15, 2.62, 'terracotta', 2.3, .25)
    b.frontWindows(5.3, 4.8, [1.48], 3); b.box('teal', [1, 1.75, .12], [2.3, 1.2, 2.07]); b.box('wood', [3.3, .14, 1.1], [2.3, 2.45, 2.35])
  } else if (level === 3) {
    b.box('white', [6.5, 5.2, 5.1], [-.55, 2.88, -.4]); b.roof(7.05, 5.7, 1.3, 5.48, 'coral', -.55, -.4)
    b.box('brick', [2.2, 4.45, 4.2], [3.15, 2.5, .05]); b.frontWindows(6.5, 5.1, [1.55, 3.65], 3); b.sideWindows(6.5, 5.1, [1.55, 3.65], 2)
    b.box('wood', [1.15, 2.05, .12], [-.55, 1.34, 2.19]); b.balcony(3.8, 3.02, 2.58, -.55, 'concrete')
  } else {
    const floors = level === 4 ? 2 : 3, floorH = 2.15, h = floors * floorH
    b.box('white', [6.4, h, 4.8], [-.8, h / 2 + .27, -.25]); b.box(level >= 5 ? 'brick' : 'teal', [2.3, h * .82, 4.05], [3.05, h * .41 + .27, .18])
    b.box('coral', [6.8, .3, 5.15], [-.8, h + .42, -.25]); b.frontWindows(6.4, 4.8, Array.from({ length: floors }, (_, i) => 1.5 + i * floorH), 3)
    for (let i = 1; i < floors; i++) b.balcony(4.4, .35 + i * floorH, 2.48, -.8, level >= 5 ? 'wood' : 'white')
    b.box('wood', [1.1, 2.02, .12], [-.8, 1.34, 2.21]); b.box('teal', [2.6, .18, 1.2], [-.8, 2.42, 2.55])
    if (level >= 5) { for (const x of [-2.6, -.8, 1]) b.planter(x, h + .58, 1.3, 1.25); b.box('green', [.45, h * .72, .3], [-4.18, h * .52, 1]) }
    if (level >= 6) { for (const x of [-2.5, -.8, .9]) b.solarPanel(x, h + .92, -.55, .85); b.box('glass', [3.3, .16, 2], [2.2, h + .65, .55]) }
  }
  b.tree(-3.75, 2.6, .8); b.tree(3.7, -2.55, .62); b.planter(-2.6, .46, 3.05, .9)
  return b.finish()
}

function createApartment(level) {
  const b = modelBuilder(); baseLot(b, 9.8, 9.2)
  const floors = [6, 8, 11, 14, 18][level - 1], fh = .78, podium = 1.25, towerH = floors * fh
  b.box('ivory', [8.8, podium, 8.15], [0, .88, 0]); b.box('brick', [8.45, .2, 8.25], [0, 1.42, 0])
  const wingW = level >= 3 ? 3.65 : 3.25, gap = level >= 4 ? 1.25 : .72
  b.box('white', [wingW, towerH, 6.6], [-wingW / 2 - gap / 2, towerH / 2 + 1.47, -.25])
  b.box(level >= 4 ? 'brick' : 'white', [wingW, towerH * (level >= 3 ? .82 : 1), 6.6], [wingW / 2 + gap / 2, towerH * (level >= 3 ? .41 : .5) + 1.47, -.25])
  const floorYs = Array.from({ length: floors }, (_, i) => 1.82 + i * fh)
  for (const x of [-wingW / 2 - gap / 2, wingW / 2 + gap / 2]) for (const y of floorYs) { b.box('glass', [wingW * .56, .38, .1], [x, y, 3.1]); b.box('glass', [wingW * .56, .38, .1], [x, y, -3.6]); b.box('glassDark', [.1, .38, 3.9], [x < 0 ? x - wingW / 2 - .04 : x + wingW / 2 + .04, y, -.25]); b.balcony(wingW * .83, y - .28, 3.36, x, iColor(level)) }
  b.box('glassDark', [1.2, 1.65, .12], [0, 1.02, 4.12]); b.box('gold', [2.9, .2, 1.25], [0, 1.92, 4.5]); b.stairs(2.4, 4.42)
  if (level >= 2) for (const x of [-3, 0, 3]) b.planter(x, 1.58, 3.65, 1.25)
  if (level >= 3) { b.box('green', [7.7, .2, 1], [0, 1.65 + towerH * .82, 1.9]); b.tree(0, 2.1, .55) }
  if (level >= 4) for (const x of [-2.5, 0, 2.5]) b.solarPanel(x, towerH + 1.82, -.8, .72)
  if (level >= 5) { b.box('glass', [1.35, towerH * .7, 5.8], [0, towerH * .35 + 1.47, -.25]); b.box('teal', [1.58, .18, 6.05], [0, towerH + 1.48, -.25]) }
  b.tree(-4, 3.55, .68); b.tree(4, 3.55, .68)
  return b.finish()
}

function iColor(level) { return level >= 4 ? 'concrete' : level >= 2 ? 'white' : 'ivory' }

const urbanConfigs = {
  mixed_use: { floors: [5, 8, 12, 16], main: 'brick', accent: 'teal' }, market: { floors: [1, 2, 3, 4], main: 'ivory', accent: 'gold' },
  office: { floors: [7, 11, 16, 22], main: 'white', accent: 'glassDark' }, supermarket: { floors: [1, 2, 3, 5], main: 'white', accent: 'teal' },
  hotel: { floors: [8, 12, 17, 22], main: 'ivory', accent: 'gold' }, clinic: { floors: [2, 4, 6, 9], main: 'white', accent: 'teal' },
  fire: { floors: [2, 3, 4, 6], main: 'ivory', accent: 'red' }, hospital: { floors: [4, 6, 9, 12], main: 'white', accent: 'teal' },
  police: { floors: [2, 4, 6, 9], main: 'concrete', accent: 'blue' }, school: { floors: [2, 3, 4, 6], main: 'ivory', accent: 'gold' },
  university: { floors: [4, 6, 8, 11], main: 'concrete', accent: 'teal' },
}

function addStorefronts(b, width, depth, count, accent) {
  const cell = width / count
  for (let i = 0; i < count; i++) { const x = -width / 2 + cell * (i + .5); b.box('glass', [cell * .66, 1.05, .12], [x, .92, depth / 2 + .07]); b.box(i % 2 ? accent : 'coral', [cell * .76, .18, .72], [x, 1.54, depth / 2 + .36]) }
}

function createUrbanBuilding(family, level) {
  const c = urbanConfigs[family], b = modelBuilder(); baseLot(b, 9.8, 9.1)
  if (family === 'market') return createMarket(b, level)
  if (family === 'school') return createSchool(b, level, false)
  if (family === 'university') return createSchool(b, level, true)
  if (family === 'clinic' || family === 'hospital') return createMedical(b, family, level)
  if (family === 'fire' || family === 'police') return createEmergency(b, family, level)
  const floors = c.floors[level - 1], fh = .76, h = floors * fh, width = family === 'mixed_use' || family === 'supermarket' ? 8.6 : 7.2, depth = family === 'mixed_use' ? 7.8 : 6.8
  b.box(c.main, [width, h, depth], [0, h / 2 + .28, 0]); b.box(c.accent, [width + .18, .2, depth + .18], [0, .52, 0])
  const floorYs = Array.from({ length: floors - 1 }, (_, i) => 1.28 + i * fh)
  if (family === 'office' || family === 'hotel') {
    for (const y of floorYs) { b.box('glass', [width * .72, .48, .11], [0, y, depth / 2 + .06]); b.box('glass', [width * .72, .48, .11], [0, y, -depth / 2 - .06]); b.box('glassDark', [.11, .48, depth * .66], [width / 2 + .06, y, 0]); b.box('glassDark', [.11, .48, depth * .66], [-width / 2 - .06, y, 0]) }
    for (const x of [-width * .31, 0, width * .31]) b.box(c.accent, [.1, h * .92, .14], [x, h * .5 + .28, depth / 2 + .1])
  } else b.frontWindows(width, depth, floorYs, 4)
  addStorefronts(b, width, depth, family === 'mixed_use' ? 4 : 3, c.accent)
  b.box('dark', [1.25, 1.65, .13], [0, 1.08, depth / 2 + .08]); b.box('coral', [2.5, .18, 1.08], [0, 1.98, depth / 2 + .4])
  if (level >= 2) { const wingH = h * .58; b.box(c.main, [width * .52, wingH, depth * .74], [width * .55, wingH / 2 + .28, -.4]); b.sideWindows(width * .52, depth * .74, Array.from({ length: Math.max(2, Math.floor(floors * .58) - 1) }, (_, i) => 1.2 + i * fh), 3) }
  if (family === 'mixed_use') { for (const y of floorYs.filter((_, i) => i % 2 === 0)) b.balcony(width * .78, y - .28, depth / 2 + .35, 0, 'white'); for (const x of [-3, 3]) b.tree(x, 3.9, .56) }
  if (family === 'supermarket') { b.box('gold', [4.2, .7, .14], [0, 2.05, depth / 2 + .09]); for (const x of [-3.4, 3.4]) b.tree(x, 3.7, .65) }
  if (family === 'hotel') { b.box('gold', [1.35, h * .78, .14], [0, h * .5, depth / 2 + .1]); b.box('coral', [3.5, .22, 1.4], [0, 2.12, depth / 2 + .55]) }
  if (level >= 3) { b.box('green', [width * .8, .18, 1], [0, h + .18, depth * .28]); b.tree(-width * .28, depth * .27, .52); b.tree(width * .28, depth * .27, .52) }
  if (level >= 4) for (const x of [-2.2, 0, 2.2]) b.solarPanel(x, h + .62, -.65, .68)
  return b.finish()
}

function createMarket(b, level) {
  const floors = level, fh = 1.75, h = floors * fh
  b.box('ivory', [8.8, h, 7.6], [0, h / 2 + .28, 0]); b.box('teal', [8.95, .22, 7.75], [0, h + .38, 0])
  if (level === 1) b.roof(9.25, 8.05, 1.45, h + .45, 'coral')
  else { b.box('white', [5.8, .48, 5], [0, h + .65, -.25]); b.box('coral', [6.1, .2, 5.3], [0, h + .94, -.25]) }
  addStorefronts(b, 8.8, 7.6, 4, 'gold'); for (let floor = 1; floor < floors; floor++) b.frontWindows(8.8, 7.6, [1.15 + floor * fh], 4)
  b.box('gold', [4.1, .58, .16], [0, 2.02, 3.88]); b.tree(-3.9, 3.55, .62); b.tree(3.9, 3.55, .62)
  if (level >= 3) { b.box('green', [7.2, .18, 1], [0, h + .62, 1.65]); for (const x of [-2.6, 0, 2.6]) b.planter(x, h + .84, 1.65, 1.1) }
  if (level >= 4) for (const x of [-2.2, 0, 2.2]) b.solarPanel(x, h + 1.15, -.8, .65)
  return b.finish()
}

function createMedical(b, family, level) {
  const hospital = family === 'hospital', floors = urbanConfigs[family].floors[level - 1], fh = .78, h = floors * fh, width = hospital ? 8.7 : 8.25, depth = hospital ? 7.9 : 7.35
  b.box('white', [width, h, depth], [0, h / 2 + .28, 0]); b.box('teal', [width + .16, .22, depth + .16], [0, h + .38, 0])
  const ys = Array.from({ length: floors - 1 }, (_, i) => 1.42 + i * fh); b.frontWindows(width, depth, ys, hospital ? 5 : 4); b.sideWindows(width, depth, ys, 3)
  b.box('coral', [width * .62, .34, 1.45], [0, 2.12, depth / 2 + .56]); b.box('glass', [2.3, 1.5, .13], [0, 1.12, depth / 2 + .08]); b.stairs(2.8, depth / 2 + .52)
  b.box('coral', [1.15, .32, .14], [0, h + .78, depth / 2 + .08]); b.box('coral', [.32, 1.15, .14], [0, h + .78, depth / 2 + .09])
  if (level >= 2) { const wingH = h * .55; b.box('white', [3.2, wingH, depth * .72], [width * .52, wingH / 2 + .28, -.4]); b.box('teal', [3.36, .18, depth * .74], [width * .52, wingH + .38, -.4]) }
  if (level >= 3) for (const x of [-2.6, 0, 2.6]) b.planter(x, h + .57, 1.45, 1)
  if (level >= 4) for (const x of [-2, 0, 2]) b.solarPanel(x, h + .82, -.75, .62)
  b.tree(-3.85, 3.35, .66); b.tree(3.85, 3.35, .66)
  return b.finish()
}

function createEmergency(b, family, level) {
  const fire = family === 'fire', floors = urbanConfigs[family].floors[level - 1], fh = .82, h = floors * fh
  b.box(fire ? 'ivory' : 'concrete', [8.7, h, 7.25], [0, h / 2 + .28, 0]); b.box(fire ? 'red' : 'blue', [8.88, .22, 7.42], [0, h + .38, 0])
  const bays = fire ? 3 : 2
  for (let i = 0; i < bays; i++) { const x = (i - (bays - 1) / 2) * 2.55; b.box('dark', [2.05, 1.45, .13], [x, 1.08, 3.69]); b.box(fire ? 'red' : 'blue', [2.25, .17, .58], [x, 1.87, 3.94]) }
  const ys = Array.from({ length: floors - 1 }, (_, i) => 2.2 + i * fh); b.frontWindows(8.7, 7.25, ys, 4)
  if (fire) { b.box('red', [1.05, h + 1.6, 1.05], [3.35, (h + 1.6) / 2 + .28, -2.4]); b.cylinder('steel', .06, 2.5, [3.35, h + 2.2, -2.4], 8) }
  else { b.box('blue', [3.6, .5, .14], [0, 2.05, 3.7]); b.cylinder('steel', .06, 1.8, [3.4, h + 1.25, -2.4], 8); b.box('blue', [1.1, .62, .05], [3.68, h + 1.7, -2.4]) }
  if (level >= 3) for (const x of [-2, 0, 2]) b.solarPanel(x, h + .72, -.7, .6)
  b.tree(-4, 3.35, .58); b.tree(4, 3.35, .58)
  return b.finish()
}

function createSchool(b, level, university) {
  const floors = urbanConfigs[university ? 'university' : 'school'].floors[level - 1], fh = .78, h = floors * fh, accent = university ? 'teal' : 'gold'
  b.box('ivory', [8.7, h, 3.1], [0, h / 2 + .28, -2.3]); b.box('ivory', [3.1, h, 5.8], [-2.8, h / 2 + .28, .9]); b.box('ivory', [3.1, h, 5.8], [2.8, h / 2 + .28, .9])
  b.roof(9.1, 3.5, .8, h + .38, 'coral', 0, -2.3); b.roof(3.5, 6.2, .8, h + .38, 'coral', -2.8, .9); b.roof(3.5, 6.2, .8, h + .38, 'coral', 2.8, .9)
  const ys = Array.from({ length: floors }, (_, i) => 1.18 + i * fh); b.frontWindows(8.7, 3.1, ys, 5); for (const x of [-2.8, 2.8]) for (const y of ys) b.box('glass', [1.65, .4, .1], [x, y, 3.84])
  b.box(accent, [3.1, .28, 1.35], [0, 2.02, 3.9]); b.box('glassDark', [1.55, 1.5, .12], [0, 1.13, 3.86]); b.stairs(2.65, 4.1)
  b.box('green', [4.1, .16, 3.3], [0, .38, .65]); b.tree(-1.25, .4, .72); b.tree(1.25, .7, .62)
  if (level >= 3) for (const x of [-2, 0, 2]) b.solarPanel(x, h + 1.05, -2.3, .62)
  if (university) { b.box('concrete', [1.2, 1.8, 1.2], [0, 1.15, .2]); b.sphere('gold', .28, [0, 2.2, .2], 10, 6) }
  return b.finish()
}

function createWaterTower(level) {
  const b = modelBuilder(); baseLot(b, 8.8, 8.4); const towerH = 5.4 + level * .55, tankY = towerH + 1.2, spread = 2.15
  for (const x of [-spread, spread]) for (const z of [-spread, spread]) { b.beam('steel', [x, .35, z], [x * .62, towerH, z * .62], .11); b.box('concrete', [.52, .25, .52], [x, .38, z]) }
  for (const y of [1.3, 2.6, 3.9, 5.1]) { const s = spread - y / towerH * .72; b.beam('steel', [-s, y, -s], [s, y + .85, -s], .055); b.beam('steel', [s, y, -s], [-s, y + .85, -s], .055); b.beam('steel', [-s, y, s], [s, y + .85, s], .055); b.beam('steel', [s, y, s], [-s, y + .85, s], .055) }
  b.cylinder('turquoise', 2.25 + level * .08, 2.5, [0, tankY, 0], 16, 1.85 + level * .08); b.sphere('turquoise', 2.23 + level * .08, [0, tankY - 1.05, 0], 16, 7, [1, .34, 1]); b.sphere('white', 1.86, [0, tankY + 1.18, 0], 16, 6, [1, .18, 1])
  b.torus('white', 2.05 + level * .08, .08, [0, tankY + .15, 0], [Math.PI / 2, 0, 0], 18); b.cylinder('steel', .07, 1.4 + level * .3, [0, tankY + 2.15, 0], 8)
  if (level >= 3) { b.box('teal', [3.4, .32, .16], [0, tankY, 2.25]); for (const x of [-2, 0, 2]) b.solarPanel(x, .85, -3, .65) }
  if (level >= 4) b.torus('glass', 2.8, .08, [0, tankY + .7, 0], [Math.PI / 2, 0, 0], 20)
  b.box('white', [2.2, 1.5, 1.8], [0, 1.02, 2.8]); b.tree(-3.35, 3, .58); b.tree(3.35, 3, .58)
  return b.finish()
}

function createSolarStation(level) {
  const b = modelBuilder(); baseLot(b, 9.6, 8.8); const rows = level >= 3 ? 3 : 2, cols = level >= 2 ? 4 : 3
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) b.solarPanel((col - (cols - 1) / 2) * 1.85, .82, (row - (rows - 1) / 2) * 2.05, .95)
  b.box('teal', [2.55, 1.65 + level * .18, 2.1], [0, 1.08 + level * .09, -3.1]); b.box('glassDark', [1.2, .72, .12], [0, 1.25, -2.02]); b.box('coral', [2.85, .22, 2.4], [0, 2 + level * .18, -3.1])
  if (level >= 3) for (const x of [-3.8, 3.8]) { b.cylinder('steel', .08, 2.8, [x, 1.68, -3], 8); b.box('gold', [.68, .42, .68], [x, 2.8, -3]) }
  if (level >= 4) { b.cylinder('turquoise', .52, 2.1, [-3.8, 1.34, 3.2], 12); b.cylinder('turquoise', .52, 2.1, [3.8, 1.34, 3.2], 12) }
  return b.finish()
}

function createDrainage(level) {
  const b = modelBuilder(); baseLot(b, 9.6, 8.8)
  b.box('concrete', [8.6, .65, 3.2], [0, .58, -2.2]); b.box('water', [7.9, .12, 2.45], [0, .96, -2.15]); b.box('concrete', [5.5 + level * .55, 2.4 + level * .35, 3.65], [1.25, 1.48 + level * .175, 1.55]); b.box('dark', [1.1, 1.55, .14], [1.25, 1.15, 3.39]); b.box('teal', [6 + level * .55, .24, 4.05], [1.25, 2.8 + level * .35, 1.55])
  const pipeCount = level >= 3 ? 3 : 2
  for (let i = 0; i < pipeCount; i++) { const x = -2.35 + i * 1.45; b.torus('turquoise', .58, .16, [x, 1.35, -.62], [0, 0, 0], 14); b.box('turquoise', [.42, .42, 2.15], [x, 1.35, -.02]) }
  b.box('steel', [4.4, .16, 2.1], [-1.7, 1.07, -2.15]); for (let x = -3.65; x <= .1; x += .46) b.box('dark', [.08, .06, 2.05], [x, 1.17, -2.15])
  if (level >= 3) for (const x of [0, 1.7, 3.4]) b.solarPanel(x, 3.4 + level * .35, 1.55, .62)
  if (level >= 4) { b.cylinder('steel', .06, 3.6, [4.1, 2.08, -2.3], 8); b.sphere('gold', .18, [4.1, 3.9, -2.3], 8, 5) }
  b.tree(-3.95, 2.9, .6); return b.finish()
}

function createSubstation(level) {
  const b = modelBuilder(); baseLot(b, 9.6, 8.8)
  for (const z of [-3.4, 3.4]) for (let x = -4; x <= 4; x += .8) b.box('steel', [.045, 1.05, .045], [x, .83, z])
  for (const x of [-4, 4]) for (let z = -3.4; z <= 3.4; z += .8) b.box('steel', [.045, 1.05, .045], [x, .83, z])
  const transformers = level >= 3 ? 3 : 2
  for (let i = 0; i < transformers; i++) { const x = (i - (transformers - 1) / 2) * 2.35; b.box('steel', [1.45, 1.2, 1.75], [x, 1.05, .3]); for (const z of [-.45, 0, .45]) b.cylinder('gold', .16, 1.25, [x, 2.18, .3 + z], 8, .11); b.box('dark', [1.62, .08, 1.92], [x, 1.7, .3]) }
  const gantries = level >= 2 ? 3 : 2
  for (let i = 0; i < gantries; i++) { const z = -2.55 + i * 2.4; for (const x of [-3.1, 3.1]) b.cylinder('steel', .08, 3.2 + level * .25, [x, 1.88 + level * .125, z], 8); b.beam('steel', [-3.1, 3.45 + level * .25, z], [3.1, 3.45 + level * .25, z], .09); for (const x of [-2, 0, 2]) b.cylinder('ivory', .11, .68, [x, 3.07 + level * .25, z], 8, .08) }
  b.box('teal', [2.2, 1.55, 1.8], [2.65, 1.02, 2.45]); b.box('coral', [2.4, .2, 2], [2.65, 1.9, 2.45]); if (level >= 4) b.solarPanel(-2.7, 1.1, 2.55, .82)
  return b.finish()
}

function createUvStation(level) {
  const b = modelBuilder(); baseLot(b, 9.2, 8.6); const mastH = 4.8 + level * .72
  b.box('white', [4.4, 2 + level * .3, 3.5], [0, 1.28 + level * .15, .9]); b.box('turquoise', [4.7, .25, 3.8], [0, 2.42 + level * .3, .9]); b.box('glassDark', [2.15, .85, .12], [0, 1.4, 2.67]); b.cylinder('steel', .18, mastH, [0, mastH / 2 + 2.4, -.95], 10, .12)
  for (const y of [3.6, 5.05, 6.5, 7.95]) if (y < mastH + 2.1) { b.torus('turquoise', .85 + level * .12, .12, [0, y, -.95], [Math.PI / 2, 0, 0], 16); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; b.beam('glass', [0, y, -.95], [Math.cos(a) * (1.45 + level * .13), y, -.95 + Math.sin(a) * (1.45 + level * .13)], .065) } }
  b.sphere('gold', .3, [0, mastH + 2.55, -.95], 10, 6); if (level >= 2) for (const x of [-2.7, 2.7]) b.solarPanel(x, .95, -2.6, .78)
  if (level >= 3) for (const x of [-3.45, 3.45]) { b.cylinder('steel', .07, 3.2, [x, 1.88, 1.8], 8); b.sphere('turquoise', .26, [x, 3.5, 1.8], 10, 6) }
  if (level >= 4) b.torus('glass', 3.7, .08, [0, 4.1, -.2], [Math.PI / 2, 0, 0], 24)
  b.tree(-3.5, 3, .58); b.tree(3.5, 3, .58); return b.finish()
}

function createSeawall(level) {
  const b = modelBuilder(); baseLot(b, 9.7, 8.8)
  b.box('water', [9.25, .18, 2.4], [0, .34, -3]); b.box('concrete', [9.25, 1.05 + level * .22, 1.25 + level * .14], [0, .78 + level * .11, -1.15]); b.box('pavement', [9.1, .3, 3.8], [0, .42, 1.45])
  for (let x = -4; x <= 4; x += 1) b.box(level >= 3 ? 'steel' : 'concrete', [.68, .5 + level * .12, .68], [x, .75 + level * .06, -2.05], [0, x * .07, 0])
  for (const x of [-3.7, -1.25, 1.25, 3.7]) { b.cylinder('steel', .07, 1.1, [x, 1.15 + level * .2, -.55], 7); if (x < 3) b.beam('steel', [x, 1.64 + level * .2, -.55], [x + 2.45, 1.64 + level * .2, -.55], .06) }
  if (level >= 2) for (const x of [-3, 0, 3]) b.box('dark', [1.1, .18, .5], [x, .78, 1.5])
  if (level >= 3) { b.box('green', [8.1, .18, .75], [0, .67, 3.35]); for (const x of [-3, -1, 1, 3]) b.sphere('foliage', .35, [x, 1.05, 3.35], 8, 5, [1.3, .8, .8]) }
  if (level >= 4) for (const x of [-3, 0, 3]) { b.cylinder('steel', .06, 2.5, [x, 1.85, 2.25], 8); b.sphere('gold', .2, [x, 3.12, 2.25], 8, 5) }
  return b.finish()
}

function archedCanopy(b, width, depth, baseY, z = 0, kind = 'glass') {
  const segments = 7, radius = width * .58
  for (let i = 0; i < segments; i++) {
    const angle = -.72 + i * 1.44 / (segments - 1)
    b.box(kind, [width / segments * 1.28, .12, depth], [Math.sin(angle) * radius, baseY + Math.cos(angle) * radius * .34, z], [0, 0, -angle * .72])
  }
}

function createBusStop(level) {
  const b = modelBuilder(); baseLot(b, 9.4, 6.4)
  const shelters = level >= 2 ? 2 : 1, shelterWidth = level >= 4 ? 3.4 : 3
  for (let i = 0; i < shelters; i++) {
    const x = shelters === 1 ? 0 : (i ? 2.05 : -2.05)
    for (const px of [-shelterWidth / 2, shelterWidth / 2]) for (const pz of [-1, 1]) b.box('teal', [.1, 2.35, .1], [x + px, 1.48, pz])
    b.box('glass', [shelterWidth, 1.75, .1], [x, 1.52, -1]); b.box('glass', [.1, 1.75, 2], [x + shelterWidth / 2, 1.52, 0])
    archedCanopy(b, shelterWidth + .45, 2.45, 2.1, 0, level >= 3 ? 'solar' : 'glass')
    b.box('wood', [shelterWidth * .7, .18, .52], [x, .72, -.25]); for (const px of [-.8, .8]) b.box('steel', [.08, .62, .08], [x + px, .42, -.25])
    b.box('white', [.68, 1.35, .12], [x - shelterWidth * .32, 1.45, 1.08]); b.box('glassDark', [.48, .62, .14], [x - shelterWidth * .32, 1.62, 1.16])
  }
  if (level >= 2) { for (const x of [-3.65, 3.65]) { b.cylinder('teal', .055, 2.7, [x, 1.62, 1.9], 7); b.sphere('gold', .14, [x, 2.98, 1.9], 8, 5) } }
  if (level >= 3) for (const x of [-3.4, -2.8, 2.8, 3.4]) b.torus('teal', .28, .045, [x, .58, 1.85], [0, Math.PI / 2, 0], 10)
  if (level >= 4) { for (const x of [-2.3, 0, 2.3]) b.box('turquoise', [1.45, .08, 1.15], [x, .36, 2.25]); b.box('coral', [1.1, 1.75, .8], [3.8, 1.15, -1.85]) }
  b.planter(-4.1, .42, -2.3, .9); b.planter(4.1, .42, -2.3, .9)
  return b.finish()
}

function createTrainStation(level) {
  const b = modelBuilder(); baseLot(b, 9.8, 9.2)
  const tracks = level >= 2 ? 4 : 2, spacing = 7.2 / tracks
  for (let i = 0; i < tracks; i++) {
    const x = -3.6 + spacing * (i + .5)
    b.box('asphalt', [spacing * .72, .08, 8.5], [x, .34, 0]); for (const dx of [-.25, .25]) b.box('rail', [.075, .12, 8.5], [x + dx, .43, 0])
    for (let z = -4; z <= 4; z += .55) b.box('wood', [spacing * .58, .07, .09], [x, .39, z])
  }
  b.box('concrete', [9.1, .34, 1.35], [0, .55, 3.55]); b.box('white', [level >= 3 ? 7.8 : 5.2, 2.3 + level * .32, 1.9], [0, 1.75 + level * .16, 3.1])
  b.box('glass', [level >= 3 ? 5.8 : 3.5, 1.15, .12], [0, 1.72, 2.12]); b.box('coral', [2.3, .22, 1.1], [0, 2.42, 1.72])
  const arches = level >= 2 ? 2 : 1
  for (let i = 0; i < arches; i++) archedCanopy(b, 4.2, 7.6, 2.2 + level * .15, (i - (arches - 1) / 2) * 2.25, level >= 4 ? 'solar' : 'glass')
  if (level >= 3) { b.box('teal', [2.1, 3.6, 1.65], [-3.55, 2.08, 3]); b.box('teal', [2.1, 3.6, 1.65], [3.55, 2.08, 3]); b.box('glassDark', [1.35, 2.35, .12], [-3.55, 2.2, 2.14]); b.box('glassDark', [1.35, 2.35, .12], [3.55, 2.2, 2.14]) }
  if (level >= 4) { b.box('white', [9, .42, 1.2], [0, 4.35, 2.95]); for (const x of [-3, -1, 1, 3]) b.solarPanel(x, 4.72, 3, .58) }
  return b.finish()
}

function createBridge(level) {
  const b = modelBuilder()
  b.box('water', [9.8, .18, 9], [0, .1, 0]); const deckWidth = [4.2, 5.4, 6.4, 7][level - 1], deckY = 1.7
  for (const z of [-3.25, 0, 3.25]) { b.box('concrete', [deckWidth + .7, 1.45, .82], [0, .85, z]); b.box('concrete', [deckWidth + 1.35, .22, 1.25], [0, .18, z]) }
  b.box('asphalt', [deckWidth, .3, 9.2], [0, deckY, 0]); for (const x of [-deckWidth / 4, deckWidth / 4]) b.box('gold', [.07, .025, 8.9], [x, deckY + .17, 0])
  for (const x of [-deckWidth / 2 + .2, deckWidth / 2 - .2]) b.box('steel', [.12, .72, 9.2], [x, deckY + .45, 0])
  if (level <= 2) {
    const sideX = deckWidth / 2 + .08
    for (const x of [-sideX, sideX]) {
      for (const z of [-4.15, -2.75, -1.35, .05, 1.45, 2.85, 4.15]) b.beam('coral', [x, deckY + .25, z], [x, deckY + 2.45, z], .09)
      for (let z = -4.15; z < 4; z += 1.4) { b.beam('coral', [x, deckY + .28, z], [x, deckY + 2.42, z + 1.4], .09); b.beam('coral', [x, deckY + 2.42, z], [x, deckY + .28, z + 1.4], .09) }
      b.beam('coral', [x, deckY + 2.48, -4.25], [x, deckY + 2.48, 4.25], .11)
    }
  } else {
    const pylons = level === 3 ? [0] : [-2.7, 2.7]
    for (const z of pylons) {
      for (const x of [-deckWidth * .42, deckWidth * .42]) b.beam('white', [x, deckY, z], [x * .42, deckY + 5.4 + level * .25, z], .16)
      b.beam('white', [-deckWidth * .17, deckY + 5.45 + level * .25, z], [deckWidth * .17, deckY + 5.45 + level * .25, z], .14)
      for (const targetZ of [-4.2, -2.8, -1.4, 1.4, 2.8, 4.2]) { b.beam('steel', [-deckWidth * .17, deckY + 5.35, z], [-deckWidth / 2, deckY + .72, targetZ], .035); b.beam('steel', [deckWidth * .17, deckY + 5.35, z], [deckWidth / 2, deckY + .72, targetZ], .035) }
    }
  }
  if (level >= 4) for (const z of [-3.2, 0, 3.2]) { b.torus('turquoise', deckWidth * .58, .08, [0, 1.05, z], [Math.PI / 2, 0, 0], 18); b.box('teal', [deckWidth + .6, .32, .22], [0, .5, z]) }
  return b.finish()
}

function createMetroStation(level) {
  const b = modelBuilder(); baseLot(b, 9.5, 8.6)
  const entrances = level >= 2 ? 2 : 1
  for (let i = 0; i < entrances; i++) {
    const x = entrances === 1 ? 0 : (i ? 2.55 : -2.55)
    b.box('white', [3.5, 1.85 + level * .28, 4.8], [x, 1.2 + level * .14, 0]); b.box('glass', [2.55, 1.3, .12], [x, 1.28, 2.44])
    archedCanopy(b, 3.9, 5.3, 2.15 + level * .28, 0, level >= 4 ? 'solar' : 'glass')
    b.box('coral', [.45, 1.65, .14], [x, 1.42, 2.52]); b.stairs(2.35, 2.65)
  }
  if (level >= 2) for (const x of [-4, 4]) { b.box('teal', [.8, 3.1, .8], [x, 1.82, 1.4]); b.box('glassDark', [.52, 1.8, .12], [x, 1.75, 1.82]) }
  if (level >= 3) { b.box('concrete', [8.8, .24, 2.2], [0, .4, -3]); b.box('glassDark', [6.8, .18, 1.3], [0, .55, -3]); for (const x of [-3.5, 3.5]) b.tree(x, -3, .55) }
  if (level >= 4) { for (const x of [-3.2, 0, 3.2]) b.solarPanel(x, 4.15, -.2, .68); b.box('turquoise', [8.4, .18, .65], [0, .42, 3.7]) }
  return b.finish()
}

function createMarina(level) {
  const b = modelBuilder(); b.box('water', [9.8, .16, 9.1], [0, .08, 0]); b.box('concrete', [9.4, .32, 1.65], [0, .3, 3.55])
  const mainPierWidth = level >= 3 ? 1.25 : .9
  b.box('wood', [mainPierWidth, .24, 7.2], [0, .5, -.2]); const fingers = level + 3
  for (let i = 0; i < fingers; i++) { const z = -3.2 + i * 5.5 / (fingers - 1); b.box('wood', [7.6, .2, .5], [0, .48, z]); for (const x of [-3.65, 3.65]) b.cylinder('steel', .055, .8, [x, .82, z], 7) }
  b.box('white', [3.2 + level * .35, 1.65 + level * .42, 2.25], [-2.45, 1.18 + level * .21, 3]); b.box('teal', [3.5 + level * .35, .22, 2.55], [-2.45, 2.12 + level * .42, 3]); b.box('glass', [1.8, .72, .12], [-2.45, 1.42, 1.86])
  b.box('concrete', [2.2, .24, 3.6], [3.35, .38, 2.25]); b.box('dark', [1.5, .15, 2.9], [3.35, .52, 2.15])
  if (level >= 2) { b.cylinder('gold', .12, 3.4, [2.8, 2.08, 3], 8); b.beam('gold', [2.8, 3.75, 3], [4.25, 3.15, 1.6], .09); b.box('coral', [1.1, .65, .8], [2.8, .88, 3]) }
  if (level >= 3) { archedCanopy(b, 5.5, 1.5, 2.25, 2.95, 'glass'); for (const x of [-3.6, 3.6]) b.cylinder('teal', .12, 3.5, [x, 2.05, -3.2], 9) }
  if (level >= 4) { for (const x of [-3.6, 3.6]) for (const z of [-2.7, -.9, .9]) b.box('concrete', [.65, 1.3, .45], [x, .78, z]); for (const x of [-3.4, -2.1, -.8]) b.solarPanel(x, 3.45, 3, .55) }
  return b.finish()
}

function createTreeAsset(kind) {
  const b = modelBuilder()
  if (kind === 'young') { b.cylinder('wood', .12, 2.45, [0, 1.25, 0], 7); b.sphere('green', .72, [0, 2.75, 0], 9, 6, [.75, 1.2, .75]); for (const z of [-.72, .72]) b.beam('steel', [0, .2, 0], [0, 1.5, z], .035) }
  if (kind === 'canopy') { b.cylinder('wood', .32, 2.55, [0, 1.3, 0], 8, .2); for (const [x,y,z,s] of [[0,3,0,1.3],[-.85,2.85,.2,.9],[.8,2.9,-.15,.95],[0,3.55,.2,.9]]) b.sphere(y > 3.2 ? 'foliage' : 'green', s, [x,y,z], 10, 7, [1.15,.82,1.05]) }
  if (kind === 'columnar') { b.cylinder('wood', .16, 2.5, [0, 1.3, 0], 7); b.cylinder('green', .7, 3.8, [0, 3.15, 0], 10, .16) }
  if (kind === 'flowering') { b.cylinder('wood', .24, 2.35, [0, 1.2, 0], 8, .15); for (const [x,y,z,s] of [[0,2.8,0,1],[-.68,2.65,.1,.72],[.65,2.7,-.15,.74],[0,3.35,.1,.68]]) b.sphere('pink', s, [x,y,z], 10, 6, [1.15,.8,1]) }
  if (kind === 'palm') { b.beam('wood', [0,0,0], [.35,4.1,0], .22, 8); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; b.box('green', [1.9,.12,.38], [.35 + Math.cos(a) * .82,4.18,Math.sin(a) * .82], [0,-a,Math.sin(a)*.18]) } }
  if (kind === 'ornamental') { b.cylinder('wood', .13, 1.8, [0,.92,0], 7); for (const [x,y,z,s] of [[0,2.1,0,.68],[-.42,2,.1,.48],[.4,2.05,-.1,.5],[0,2.55,0,.45]]) b.sphere('yellow',s,[x,y,z],8,5,[1.15,.8,1]) }
  return b.finish()
}

function createPark(level) {
  const b = modelBuilder(); baseLot(b, 9.6, 9.2)
  b.box('green', [8.9, .16, 8.5], [0, .34, 0])
  const fountainRadius = level >= 3 ? 1.05 : .82
  b.cylinder('concrete', fountainRadius + .28, .22, [0, .5, 0], 20)
  b.cylinder('water', fountainRadius, .12, [0, .64, 0], 20)
  b.cylinder('white', .15, .72 + level * .12, [0, .96, 0], 10)
  b.sphere('water', .2 + level * .03, [0, 1.36 + level * .12, 0], 10, 6)
  for (const rotation of [0, Math.PI / 2]) b.box(level >= 3 ? 'wood' : 'pavement', [8.2, .12, .82], [0, .47, 0], [0, rotation, 0])
  for (const [x, z] of [[-3.3, -3], [3.25, -3], [-3.25, 3], [3.3, 3]]) b.tree(x, z, level >= 3 ? .76 : .65)
  for (const [x, z, r] of [[-2.2, -1.9, 0], [2.2, 1.9, Math.PI], [-2.2, 1.9, Math.PI / 2], [2.2, -1.9, -Math.PI / 2]]) {
    b.box('wood', [1.25, .14, .42], [x, .72, z], [0, r, 0]); b.box('steel', [1.15, .5, .1], [x, .94, z - .18], [0, r, 0])
  }
  if (level >= 2) {
    for (const x of [-2.7, 2.7]) { b.cylinder('wood', .12, 2.35, [x, 1.52, .85], 8); b.beam('wood', [x, 2.68, -.35], [x, 2.68, 2.05], .1) }
    for (let x = -2.7; x <= 2.7; x += .68) b.beam('coral', [x, 2.73, -.35], [x, 2.73, 2.05], .075)
    b.box('sand', [2.2, .12, 1.55], [-2.65, .48, -1.6]); b.box('coral', [.32, 1.35, .32], [-2.65, 1.18, -1.6]); b.box('gold', [1.5, .16, .45], [-2.65, 1.78, -1.6])
  }
  if (level >= 3) {
    b.add('water', new THREE.SphereGeometry(1.55, 18, 9), [0, .35, 2.15], [1.45, .11, .88])
    for (let x = -3.1; x <= 3.1; x += .62) b.box('wood', [.5, .12, 2.65], [x, .61, 2.05], [0, .12 * Math.sin(x), 0])
    for (const x of [-3.7, 3.7]) b.tree(x, .75, .72)
  }
  if (level >= 4) {
    const pavilionY = 3.25
    for (const x of [-2.8, 0, 2.8]) for (const z of [-2.8, 0]) b.cylinder('white', .13, pavilionY, [x, pavilionY / 2 + .4, z], 9)
    for (let i = -3; i <= 3; i++) b.beam(i % 2 ? 'white' : 'gold', [-3.6, pavilionY + .4, i * .55], [3.6, pavilionY + .65 + Math.cos(i) * .25, i * .55], .1)
    for (const x of [-2.4, 0, 2.4]) b.solarPanel(x, pavilionY + .92, -.25, .62)
  }
  return b.finish()
}

function createDefenseAsset(family, level) {
  const b = modelBuilder(); baseLot(b, 9.6, 8.9); const tier = 1 + (level - 1) * .18
  if (family === 'shelter') {
    b.box('concrete', [8.1, 1.1 * tier, 6.8], [0, .82 * tier, 0]); b.box('green', [7.6, .22, 6.3], [0, 1.48 * tier, 0])
    b.box('steel', [2.2, 1.45, .18], [0, .9, 3.46]); b.box('gold', [2.5, .18, .82], [0, 1.72, 3.72])
    for (const x of [-3, 3]) { b.cylinder('steel', .25, 1.35 + level * .3, [x, 2.1, -1.9], 10); b.box('dark', [.8, .2, .8], [x, 2.8 + level * .3, -1.9]) }
    if (level >= 2) for (const x of [-2.5, 0, 2.5]) b.solarPanel(x, 1.9 + level * .18, -.4, .68)
    if (level >= 3) { b.box('white', [3.2, 1.5, 2.4], [2.15, 2.2, 1.15]); b.box('teal', [3.45, .2, 2.65], [2.15, 3.05, 1.15]) }
    if (level >= 4) for (const x of [-3.6, 3.6]) { b.cylinder('steel', .07, 3.7, [x, 2.2, 2.7], 8); b.sphere('gold', .2, [x, 4.08, 2.7], 8, 5) }
  } else if (family === 'security_hub') {
    const floors = level + 2, h = floors * .92
    b.box('concrete', [7.7, h, 6.6], [0, h / 2 + .28, 0]); b.box('blue', [7.95, .24, 6.85], [0, h + .4, 0])
    b.frontWindows(7.7, 6.6, Array.from({ length: floors }, (_, i) => 1.02 + i * .92), 4, 'glassDark')
    b.box('glass', [2.2, 1.55, .14], [0, 1.1, 3.37]); b.box('blue', [3.1, .28, 1.1], [0, 2.05, 3.78])
    b.cylinder('steel', .12, 2.2 + level * .35, [0, h + 1.55, -.75], 8)
    b.torus('turquoise', .8 + level * .1, .1, [0, h + 2.65 + level * .35, -.75], [Math.PI / 2, 0, 0], 20)
    if (level >= 3) for (const x of [-2.8, 0, 2.8]) b.solarPanel(x, h + .78, 1.45, .62)
    if (level >= 4) for (const x of [-3.2, 3.2]) b.sphere('turquoise', .25, [x, h + 1.4, 0], 10, 6)
  } else if (family === 'research_lab') {
    const h = 2.2 + level * .65
    b.cylinder('white', 3.65, h, [0, h / 2 + .28, 0], 16, 3.25)
    b.torus('teal', 3.2, .18, [0, h + .34, 0], [Math.PI / 2, 0, 0], 24)
    b.sphere('glass', 2.45 + level * .14, [0, h + .34, 0], 20, 10, [1, .45, 1])
    b.box('glassDark', [2.1, 1.45, .12], [0, 1.15, 3.42]); b.box('coral', [2.8, .22, 1.1], [0, 2.02, 3.78])
    for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) { const x = Math.cos(angle) * 3.75, z = Math.sin(angle) * 3.75; b.cylinder('steel', .07, 2.1 + level * .3, [x, 1.45 + level * .15, z], 8); b.sphere('turquoise', .2, [x, 2.55 + level * .3, z], 8, 5) }
    if (level >= 3) for (const x of [-2.2, 0, 2.2]) b.solarPanel(x, h + 1.55, -.5, .58)
  } else {
    const towerH = 6.2 + level * 1.4
    b.cylinder('concrete', 1.45 + level * .08, towerH, [0, towerH / 2 + .28, 0], 12, 1.9)
    b.box('dark', [4.7, .75 + level * .08, 3.3], [0, towerH + .42, 0]); b.box('teal', [5, .22, 3.6], [0, towerH + .94, 0])
    for (const x of [-1.55, 1.55]) b.cylinder('steel', .22, 2.4 + level * .3, [x, towerH + 2.05, .2], 10, .1)
    b.sphere('turquoise', .44, [0, towerH + 1.55, 0], 12, 7)
    for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) b.beam('steel', [0, towerH + 1.55, 0], [Math.cos(angle) * (2.6 + level * .2), towerH + 1.55, Math.sin(angle) * (2.6 + level * .2)], .08)
    if (level >= 3) for (const x of [-3.2, 3.2]) b.solarPanel(x, .92, 2.6, .72)
    if (level >= 4) b.torus('turquoise', 3.8, .1, [0, towerH + 1.55, 0], [Math.PI / 2, 0, 0], 28)
  }
  return b.finish()
}

function createWindTurbine(level) {
  const b = modelBuilder(); baseLot(b, 8.8, 8.4); const towerH = 6.2 + level * 1.05, rotorY = towerH + .45, radius = 2.2 + level * .24
  if (level >= 3) {
    b.cylinder('white', 2.65 + level * .1, 1.05, [0, .78, 0], 18, 2.35)
    for (const x of [-1.4, 1.4]) b.box('glass', [1.05, .62, .12], [x, .85, 2.5])
    b.torus('turquoise', 2.25, .12, [0, 1.42, 0], [Math.PI / 2, 0, 0], 24)
  }
  b.cylinder('white', .42 + level * .04, towerH, [0, towerH / 2 + .28, 0], 14, .78 + level * .04)
  b.box('teal', [1.45, .72, .78], [0, rotorY, .05]); b.sphere('steel', .45, [0, rotorY, .48], 12, 7)
  for (let i = 0; i < 3; i++) {
    const angle = i * Math.PI * 2 / 3 + (level % 2) * .18
    const start = [Math.cos(angle) * .35, rotorY + Math.sin(angle) * .35, .52]
    const end = [Math.cos(angle) * radius, rotorY + Math.sin(angle) * radius, .52]
    b.beam('white', start, end, .16, 8)
    b.box('coral', [.22, .32, .16], end, [0, 0, angle])
  }
  if (level >= 2) b.box('white', [2.8, 1.5, 2.2], [2.4, 1.03, -2.35])
  if (level >= 3) for (const x of [-2.8, 0, 2.8]) b.solarPanel(x, 1.72, 2.6, .6)
  return b.finish()
}

function createLandmark(family, level) {
  const b = modelBuilder(); baseLot(b, 9.8, 9.2)
  if (family === 'civic_tower') {
    const h = 8 + level * 2.7, width = 4.4 - level * .18
    b.box('glassDark', [width, h, 4.1], [0, h / 2 + .28, 0]); b.box('white', [width + .55, .28, 4.65], [0, .5, 0])
    for (const x of [-width / 2 - .08, width / 2 + .08]) b.beam('white', [x, .5, 2], [x * .62, h + .35, 2], .14)
    for (const y of [2.2, 4.8, 7.4, 10, 12.6, 15.2].filter(value => value < h)) { b.box(y % 5 < 1 ? 'coral' : 'teal', [width + .4, .25, 4.5], [0, y, 0]); b.box('green', [width * .7, .18, .7], [0, y + .2, 1.72]) }
    b.torus('gold', width * .62, .12, [0, h + .65, 0], [Math.PI / 2, 0, 0], 24)
    if (level >= 4) b.sphere('turquoise', .65, [0, h + 1.55, 0], 14, 8)
  } else if (family === 'airport_terminal') {
    const wings = level >= 3 ? 3 : 2, terminalH = 2.4 + level * .42
    b.box('white', [8.6, terminalH, 3.4], [0, terminalH / 2 + .28, .8]); b.box('glass', [7.45, 1.45, .14], [0, 1.3, 2.53])
    archedCanopy(b, 8.9, 4.2, terminalH + .15, .8, level >= 4 ? 'solar' : 'white')
    for (let i = 0; i < wings; i++) { const x = (i - (wings - 1) / 2) * 3.25; b.box('concrete', [2.45, .35, 4.65], [x, .52, -2.35]); b.box('glassDark', [1.4, .35, 3.9], [x, .75, -2.35]) }
    b.box('teal', [1.3, 1.2 + level * .22, 1.1], [3.35, terminalH + .85, .75]); b.box('glass', [.82, .58, .82], [3.35, terminalH + 1.38 + level * .22, .75])
    if (level >= 3) for (const x of [-2.8, 0, 2.8]) b.solarPanel(x, terminalH + 1.15, .55, .58)
  } else if (family === 'ferris_wheel') {
    const radius = 2.7 + level * .38, centerY = radius + 1.15
    b.torus('white', radius, .12 + level * .015, [0, centerY, 0], [0, 0, 0], 36)
    b.torus('teal', radius * .78, .07, [0, centerY, 0], [0, 0, 0], 32)
    for (let i = 0; i < 12 + level * 2; i++) { const angle = i * Math.PI * 2 / (12 + level * 2), x = Math.cos(angle) * radius, y = centerY + Math.sin(angle) * radius; b.beam('steel', [0, centerY, 0], [x, y, 0], .035); b.box(i % 2 ? 'turquoise' : 'coral', [.42, .48, .5], [x, y, 0]) }
    b.sphere('gold', .42, [0, centerY, 0], 12, 7)
    for (const side of [-1, 1]) { b.beam('coral', [side * 2.5, .42, 0], [0, centerY, 0], .18); b.beam('coral', [side * 1.3, .42, 0], [0, centerY, 0], .12) }
    b.box('white', [6.7, .75, 2.1], [0, .72, 0]); b.box('glass', [3.2, .68, .14], [0, .82, 1.08])
  } else {
    const radius = 3.65 + level * .18, bowlY = 1.35 + level * .18
    b.add('white', new THREE.TorusGeometry(radius, .75 + level * .08, 8, 28), [0, bowlY, 0], [1.15, 1, 1], [Math.PI / 2, 0, 0])
    b.add('coral', new THREE.TorusGeometry(radius - .58, .38, 7, 28), [0, bowlY + .22, 0], [1.15, 1, 1], [Math.PI / 2, 0, 0])
    b.box('green', [5.4, .12, 3.1], [0, .58, 0]); b.box('white', [1.1, .08, 3], [0, .66, 0])
    for (const x of [-4.15, 4.15]) for (const z of [-2.8, 2.8]) { b.cylinder('steel', .09, 3.4 + level * .5, [x, 2.05 + level * .25, z], 8); b.box('gold', [.58, .38, .58], [x, 3.8 + level * .5, z]) }
    if (level >= 3) for (let i = -3; i <= 3; i++) b.beam(level >= 4 ? 'turquoise' : 'white', [-4.6, 3.6 + level * .3, i * .72], [4.6, 3.6 + level * .3 + Math.cos(i) * .75, i * .72], .1)
  }
  return b.finish()
}

function createStreetProp(kind) {
  const b = modelBuilder()
  if (kind === 'bench') { b.box('wood', [1.65, .16, .48], [0, .65, 0]); b.box('wood', [1.65, .65, .12], [0, .92, -.2]); for (const x of [-.65, .65]) b.box('steel', [.09, .62, .09], [x, .34, 0]) }
  if (kind === 'street_light') { b.cylinder('dark', .065, 2.8, [0, 1.4, 0], 8); b.sphere('gold', .24, [0, 2.86, 0], 10, 6) }
  if (kind === 'traffic_light') { b.cylinder('dark', .07, 2.7, [0, 1.35, 0], 8); b.box('dark', [.38, .95, .32], [0, 2.35, 0]); for (const [y, color] of [[2.65, 'red'], [2.36, 'gold'], [2.08, 'green']]) b.sphere(color, .1, [0, y, .18], 8, 5) }
  if (kind === 'bin') { b.cylinder('teal', .34, .92, [0, .48, 0], 12, .29); b.torus('dark', .3, .04, [0, .94, 0], [Math.PI / 2, 0, 0], 14) }
  if (kind === 'bike_rack') for (const x of [-.65, 0, .65]) b.torus('steel', .42, .055, [x, .43, 0], [0, 0, 0], 12)
  if (kind === 'hydrant') { b.cylinder('teal', .24, .78, [0, .42, 0], 10, .2); b.sphere('teal', .28, [0, .84, 0], 10, 6); b.cylinder('steel', .1, .48, [0, .58, 0], 8, .1, [0, 0, Math.PI / 2]) }
  if (kind === 'bollard') { b.cylinder('teal', .12, .72, [0, .36, 0], 10, .1); b.torus('gold', .12, .025, [0, .58, 0], [Math.PI / 2, 0, 0], 10) }
  if (kind === 'planter') { b.box('wood', [.9, .65, .9], [0, .33, 0]); b.sphere('green', .48, [0, .92, 0], 10, 6, [1.1, .72, 1.1]) }
  return b.finish()
}

function createVehicle(kind) {
  const b = modelBuilder(), bus = kind === 'bus', fire = kind === 'fire_engine', length = bus ? 4.5 : fire ? 3.8 : 2.15, width = bus ? 1.28 : 1.2, bodyH = bus ? 1.25 : .82
  b.box(fire ? 'red' : bus ? 'white' : 'coral', [width, bodyH, length], [0, .72, 0])
  b.box('glassDark', [width * .82, bus ? .78 : .48, length * (bus ? .55 : .42)], [0, bus ? 1.18 : 1.05, bus ? -.12 : -.25])
  for (const x of [-width * .48, width * .48]) for (const z of [-length * .3, length * .3]) b.torus('dark', .25, .09, [x, .35, z], [0, Math.PI / 2, 0], 12)
  if (bus) { b.box('teal', [width + .03, .2, length], [0, .58, 0]); b.box('coral', [width + .04, .08, length], [0, 1.42, 0]) }
  if (fire) { b.box('white', [width + .04, .18, length * .8], [0, .72, -.18]); b.box('steel', [.72, .18, length * .72], [0, 1.46, -.2]); b.box('blue', [.58, .16, .35], [0, 1.62, .55]) }
  if (kind === 'car') b.box('teal', [width + .03, .08, length * .72], [0, 1.34, -.08])
  return b.finish()
}

let generatedCount = 0

async function exportGlb(object, output) {
  const scene = new THREE.Scene(); scene.add(object)
  const data = await new Promise((resolve, reject) => new GLTFExporter().parse(scene, resolve, reject, { binary: true, onlyVisible: true }))
  await writeFile(output, Buffer.from(data))
  generatedCount += 1
}

const outputDir = new URL('../assets/models/', import.meta.url)
await mkdir(outputDir, { recursive: true })
for (let level = 1; level <= 6; level++) await exportGlb(createHouse(level), new URL(`house_lv${level}.glb`, outputDir))
for (let level = 1; level <= 5; level++) await exportGlb(createApartment(level), new URL(`apartment_lv${level}.glb`, outputDir))
for (const family of Object.keys(urbanConfigs)) for (let level = 1; level <= 4; level++) await exportGlb(createUrbanBuilding(family, level), new URL(`${family}_lv${level}.glb`, outputDir))
const utilityFactories = { water: createWaterTower, solar: createSolarStation, drain: createDrainage, substation: createSubstation, uv_station: createUvStation, seawall: createSeawall }
for (const [family, factory] of Object.entries(utilityFactories)) for (let level = 1; level <= 4; level++) await exportGlb(factory(level), new URL(`${family}_lv${level}.glb`, outputDir))
const transportFactories = { bus_stop: createBusStop, train_station: createTrainStation, bridge: createBridge, metro_station: createMetroStation, marina: createMarina }
for (const [family, factory] of Object.entries(transportFactories)) for (let level = 1; level <= 4; level++) await exportGlb(factory(level), new URL(`${family}_lv${level}.glb`, outputDir))
for (const tree of ['young','canopy','columnar','flowering','palm','ornamental']) await exportGlb(createTreeAsset(tree), new URL(`tree_${tree}.glb`, outputDir))
for (let level = 1; level <= 4; level++) await exportGlb(createPark(level), new URL(`park_lv${level}.glb`, outputDir))
for (const family of ['shelter', 'security_hub', 'research_lab', 'defense_tower']) for (let level = 1; level <= 4; level++) await exportGlb(createDefenseAsset(family, level), new URL(`${family}_lv${level}.glb`, outputDir))
for (let level = 1; level <= 4; level++) await exportGlb(createWindTurbine(level), new URL(`wind_lv${level}.glb`, outputDir))
for (const family of ['civic_tower', 'airport_terminal', 'ferris_wheel', 'stadium']) for (let level = 1; level <= 4; level++) await exportGlb(createLandmark(family, level), new URL(`${family}_lv${level}.glb`, outputDir))
for (const prop of ['bench', 'street_light', 'traffic_light', 'bin', 'bike_rack', 'hydrant', 'bollard', 'planter']) await exportGlb(createStreetProp(prop), new URL(`prop_${prop}.glb`, outputDir))
for (const vehicle of ['car', 'bus', 'fire_engine']) await exportGlb(createVehicle(vehicle), new URL(`vehicle_${vehicle}.glb`, outputDir))
console.log(`Generated ${generatedCount} optimized GLB models in assets/models`)
