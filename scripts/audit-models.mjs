import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const modelDir = path.resolve('assets/models')
const files = (await readdir(modelDir)).filter(file => file.endsWith('.glb')).sort()
const assets = []

for (const file of files) {
  const buffer = await readFile(path.join(modelDir, file))
  const json = readGlbJson(buffer)
  const positionAccessors = []
  let vertices = 0, triangles = 0, drawCalls = 0
  for (const mesh of json.meshes ?? []) for (const primitive of mesh.primitives ?? []) {
    drawCalls += 1
    const position = json.accessors?.[primitive.attributes?.POSITION]
    if (position) { positionAccessors.push(position); vertices += position.count ?? 0 }
    const indices = json.accessors?.[primitive.indices]
    triangles += Math.floor((indices?.count ?? position?.count ?? 0) / 3)
  }
  const bounds = mergeBounds(positionAccessors)
  const materials = json.materials ?? []
  const pbrMaterials = materials.filter(material => material.pbrMetallicRoughness).length
  const transformedNodes = (json.nodes ?? []).filter(node => node.matrix || node.translation || node.rotation || node.scale).length
  const width = bounds ? bounds.max[0] - bounds.min[0] : 0
  const height = bounds ? bounds.max[1] - bounds.min[1] : 0
  const depth = bounds ? bounds.max[2] - bounds.min[2] : 0
  const bottomCentered = Boolean(bounds && Math.abs(bounds.min[1]) <= .06 && Math.abs(bounds.min[0] + bounds.max[0]) <= .12 && Math.abs(bounds.min[2] + bounds.max[2]) <= .12)
  const warnings = []
  if (pbrMaterials !== materials.length) warnings.push('non-pbr-material')
  if (!bottomCentered) warnings.push('pivot-not-bottom-center')
  if (transformedNodes) warnings.push('node-transforms-require-runtime-bounds')
  if (drawCalls > 10) warnings.push('high-draw-call-count')
  if (vertices > 60000) warnings.push('high-vertex-count')
  if (buffer.byteLength > 500000) warnings.push('large-file')
  assets.push({ file, bytes: buffer.byteLength, vertices, triangles, drawCalls, materials: materials.length, pbrMaterials, transformedNodes, bounds, dimensions: { width, height, depth }, bottomCentered, suggestedTileScale: width || depth ? Number((2.9 / Math.max(width, depth)).toFixed(4)) : null, nodeNames: (json.nodes ?? []).map(node => node.name).filter(Boolean), warnings })
}

const report = { generatedAt: new Date().toISOString(), assetCount: assets.length, totalBytes: assets.reduce((sum, asset) => sum + asset.bytes, 0), assets }
await writeFile(path.join(modelDir, 'asset-audit.json'), `${JSON.stringify(report, null, 2)}\n`)
await writeFile(path.resolve('docs/asset-audit.md'), markdown(report))
console.log(`Audited ${report.assetCount} GLB assets (${(report.totalBytes / 1024 / 1024).toFixed(2)} MiB).`)

function readGlbJson(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'glTF') throw new Error('Invalid GLB magic')
  let offset = 12
  while (offset < buffer.length) {
    const length = buffer.readUInt32LE(offset), type = buffer.readUInt32LE(offset + 4)
    if (type === 0x4e4f534a) return JSON.parse(buffer.toString('utf8', offset + 8, offset + 8 + length).replace(/\0+$/, ''))
    offset += 8 + length
  }
  throw new Error('GLB JSON chunk not found')
}

function mergeBounds(accessors) {
  const valid = accessors.filter(accessor => accessor.min?.length === 3 && accessor.max?.length === 3)
  if (!valid.length) return null
  return {
    min: [0, 1, 2].map(axis => Math.min(...valid.map(accessor => accessor.min[axis]))),
    max: [0, 1, 2].map(axis => Math.max(...valid.map(accessor => accessor.max[axis]))),
  }
}

function markdown(report) {
  const warningCount = report.assets.filter(asset => asset.warnings.length).length
  const lines = [
    '# Haven City Asset Audit', '',
    `- Assets: ${report.assetCount}`,
    `- Total size: ${(report.totalBytes / 1024 / 1024).toFixed(2)} MiB`,
    `- Assets requiring review: ${warningCount}`, '',
    '| Asset | Size KB | Vertices | Draws | PBR | Bottom pivot | Suggested scale | Warnings |',
    '| --- | ---: | ---: | ---: | ---: | --- | ---: | --- |',
  ]
  for (const asset of report.assets) lines.push(`| ${asset.file} | ${(asset.bytes / 1024).toFixed(1)} | ${asset.vertices} | ${asset.drawCalls} | ${asset.pbrMaterials}/${asset.materials} | ${asset.bottomCentered ? 'yes' : 'no'} | ${asset.suggestedTileScale ?? '-'} | ${asset.warnings.join(', ') || '-'} |`)
  return `${lines.join('\n')}\n`
}
