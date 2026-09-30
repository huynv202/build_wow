import { AssetContainer } from '@babylonjs/core/assetContainer'
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Matrix, Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { Node } from '@babylonjs/core/node'
import { Scene } from '@babylonjs/core/scene'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import type { Material } from '@babylonjs/core/Materials/material'
import type { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'

export interface LegacyNodeState {
  id: string
  name: string
  position: Vector3
  rotation: Vector3
  rotationQuaternion: Quaternion | null
  scaling: Vector3
  checkCollisions: boolean
  isPickable: boolean
  metadata: unknown
  collisionFootprint: { width: number; depth: number; height?: number }
}

export interface AssetInstanceOptions extends Partial<LegacyNodeState> {
  assetScale?: number | Vector3
  collisionFootprint?: { width: number; depth: number; height?: number }
  parent?: TransformNode
  shadowGenerator?: ShadowGenerator
  receiveShadows?: boolean
  collisionEnabled?: boolean
  lod?: { detailDistance: number; cullDistance: number }
}

export interface LegacyGridPlacement {
  id: string
  assetKey: string
  gridX: number
  gridY: number
  rotationY?: number
  level?: number
  metadata?: unknown
}

export interface LegacyGridProjection {
  originX?: number
  originZ?: number
  baseY?: number
  toWorld?: (placement: LegacyGridPlacement, tileSize: number) => Vector3
}

export interface AssetSource {
  rootUrl: string
  fileName: string
  scale?: number | Vector3
  collisionFootprint?: { width: number; depth: number; height?: number }
}

export function snapshotLegacyNode(mesh: AbstractMesh): LegacyNodeState {
  const bounds = mesh.getBoundingInfo().boundingBox
  const size = bounds.maximum.subtract(bounds.minimum)
  return {
    id: mesh.id,
    name: mesh.name,
    position: mesh.position.clone(),
    rotation: mesh.rotation.clone(),
    rotationQuaternion: mesh.rotationQuaternion?.clone() ?? null,
    scaling: mesh.scaling.clone(),
    checkCollisions: mesh.checkCollisions,
    isPickable: mesh.isPickable,
    metadata: mesh.metadata,
    collisionFootprint: {
      width: Math.max(.2, size.x),
      depth: Math.max(.2, size.z),
      height: Math.max(.2, size.y),
    },
  }
}

export function prepareAssetContainer(container: AssetContainer) {
  const replacements = new Map<Material, Material>()
  container.meshes.forEach(mesh => {
    if (mesh.material) {
      const upgraded = replacements.get(mesh.material) ?? upgradeToPbr(mesh.material, container.scene)
      replacements.set(mesh.material, upgraded)
      mesh.material = upgraded
    }
    mesh.checkCollisions = false
    mesh.isPickable = false
    mesh.receiveShadows = true
    mesh.alwaysSelectAsActiveMesh = false
  })
  for (const material of new Set(replacements.values())) material.freeze()
  return container
}

export function instantiatePreparedAsset(container: AssetContainer, options: AssetInstanceOptions) {
  const id = options.id ?? `asset-${crypto.randomUUID()}`
  const entries = container.instantiateModelsToScene(sourceName => `${id}::${sourceName}`, false)
  return attachImportedNodes(container.scene, entries.rootNodes, id, options)
}

export async function importLegacyReplacement(scene: Scene, legacy: AbstractMesh, source: AssetSource, disposeLegacy = true) {
  const state = snapshotLegacyNode(legacy)
  legacy.setEnabled(false)
  try {
    const result = await SceneLoader.ImportMeshAsync(null, source.rootUrl, source.fileName, scene)
    const rootNodes = result.transformNodes.filter(node => !node.parent)
    const looseMeshes = result.meshes.filter(mesh => !mesh.parent)
    const wrapper = attachImportedNodes(scene, [...rootNodes, ...looseMeshes], state.id, {
      ...state,
      assetScale: source.scale,
      collisionFootprint: source.collisionFootprint ?? state.collisionFootprint,
      collisionEnabled: state.checkCollisions,
    })
    result.meshes.forEach(mesh => {
      if (mesh === wrapper) return
      if (mesh.material) mesh.material = upgradeToPbr(mesh.material, scene)
      mesh.receiveShadows = true
      mesh.checkCollisions = false
    })
    if (disposeLegacy) legacy.dispose(false, false)
    return wrapper
  } catch (error) {
    legacy.setEnabled(true)
    throw error
  }
}

export async function batchReplaceLegacyGrid(
  scene: Scene,
  placements: LegacyGridPlacement[],
  containers: Map<string, AssetContainer>,
  tileSize: number,
  parent?: TransformNode,
  projection: LegacyGridProjection = {},
) {
  const instances = new Map<string, Mesh>()
  for (const placement of placements) {
    const container = containers.get(placement.assetKey)
    if (!container) throw new Error(`Missing prepared asset: ${placement.assetKey}`)
    const position = projection.toWorld?.(placement, tileSize) ?? new Vector3(
      (projection.originX ?? 0) + placement.gridX * tileSize,
      projection.baseY ?? 0,
      (projection.originZ ?? 0) + placement.gridY * tileSize,
    )
    const wrapper = instantiatePreparedAsset(container, {
      id: placement.id,
      name: placement.id,
      position,
      rotation: new Vector3(0, placement.rotationY ?? 0, 0),
      scaling: Vector3.One(),
      metadata: { ...asRecord(placement.metadata), gridX: placement.gridX, gridY: placement.gridY, level: placement.level ?? 1 },
      parent,
      collisionEnabled: true,
      collisionFootprint: { width: tileSize * .88, depth: tileSize * .88 },
    })
    instances.set(placement.id, wrapper)
  }
  return instances
}

function attachImportedNodes(scene: Scene, nodes: Node[], id: string, options: AssetInstanceOptions) {
  const content = new TransformNode(`${id}::visual`, scene)
  nodes.forEach(node => { node.parent = content })
  content.scaling.copyFrom(toVector(options.assetScale ?? 1))
  content.computeWorldMatrix(true)
  content.getChildMeshes(false).forEach(mesh => mesh.computeWorldMatrix(true))

  const bounds = content.getHierarchyBoundingVectors(true)
  const centerX = (bounds.min.x + bounds.max.x) / 2
  const centerZ = (bounds.min.z + bounds.max.z) / 2
  const size = bounds.max.subtract(bounds.min)
  content.position.set(-centerX, -bounds.min.y, -centerZ)

  const footprint = options.collisionFootprint
  const height = Math.max(.2, footprint?.height ?? size.y)
  const wrapper = MeshBuilder.CreateBox(id, {
    width: Math.max(.2, footprint?.width ?? size.x),
    depth: Math.max(.2, footprint?.depth ?? size.z),
    height,
  }, scene)
  wrapper.bakeTransformIntoVertices(Matrix.Translation(0, height / 2, 0))
  wrapper.id = id
  wrapper.name = options.name ?? id
  wrapper.visibility = 0
  wrapper.isPickable = options.isPickable ?? false
  wrapper.checkCollisions = options.collisionEnabled ?? options.checkCollisions ?? true
  wrapper.metadata = options.metadata
  wrapper.position.copyFrom(options.position ?? Vector3.Zero())
  wrapper.rotation.copyFrom(options.rotation ?? Vector3.Zero())
  wrapper.rotationQuaternion = options.rotationQuaternion?.clone() ?? null
  wrapper.scaling.copyFrom(options.scaling ?? Vector3.One())
  wrapper.parent = options.parent ?? null
  content.parent = wrapper

  content.getChildMeshes(false).forEach(mesh => {
    mesh.metadata = options.metadata
    mesh.receiveShadows = options.receiveShadows ?? true
    mesh.isPickable = options.isPickable ?? true
    mesh.checkCollisions = false
    options.shadowGenerator?.addShadowCaster(mesh)
    const distance = isDetailMesh(mesh.name) ? options.lod?.detailDistance : options.lod?.cullDistance
    if (distance) {
      const source = mesh instanceof InstancedMesh ? mesh.sourceMesh : mesh
      if (source instanceof Mesh && !source.hasLODLevels) source.addLODLevel(distance, null)
    }
  })
  return wrapper
}

function upgradeToPbr(material: Material, scene: Scene): Material {
  if (material instanceof PBRMaterial) {
    material.metallic = material.metallic ?? .05
    material.roughness = material.roughness ?? .72
    material.environmentIntensity = .72
    material.usePhysicalLightFalloff = true
    return material
  }
  if (!(material instanceof StandardMaterial)) return material
  const pbr = new PBRMaterial(`${material.name || 'legacy'}::pbr`, scene)
  pbr.albedoColor = material.diffuseColor.clone()
  pbr.albedoTexture = material.diffuseTexture
  pbr.bumpTexture = material.bumpTexture
  pbr.emissiveColor = material.emissiveColor.clone()
  pbr.emissiveTexture = material.emissiveTexture
  pbr.alpha = material.alpha
  pbr.backFaceCulling = material.backFaceCulling
  pbr.metallic = .04
  pbr.roughness = .76
  pbr.environmentIntensity = .72
  pbr.usePhysicalLightFalloff = true
  return pbr
}

function toVector(value: number | Vector3) { return typeof value === 'number' ? new Vector3(value, value, value) : value }
function asRecord(value: unknown): Record<string, unknown> { return value && typeof value === 'object' ? value as Record<string, unknown> : {} }
function isDetailMesh(name: string) { return /glass|window|wood|green|foliage|pavement|concrete/i.test(name) }
