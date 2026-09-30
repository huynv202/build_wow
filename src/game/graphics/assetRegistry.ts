export interface AssetProfile {
  legacyType: string
  key: string
  rootUrl: string
  fileName: string
  scale: number
  collisionWidth: number
  collisionDepth: number
  detailDistance: number
  cullDistance: number
}

const BUILDING_ASSETS: Record<string, { prefix: string; scale?: number }> = {
  house: { prefix: 'house', scale: .3 }, apartment: { prefix: 'apartment' }, mixed_use: { prefix: 'mixed_use' },
  market: { prefix: 'market' }, office: { prefix: 'office' }, supermarket: { prefix: 'supermarket' }, hotel: { prefix: 'hotel' },
  clinic: { prefix: 'clinic' }, fire: { prefix: 'fire' }, hospital: { prefix: 'hospital' }, police: { prefix: 'police' },
  school: { prefix: 'school' }, university: { prefix: 'university' }, water: { prefix: 'water' }, solar: { prefix: 'solar' },
  drain: { prefix: 'drain' }, substation: { prefix: 'substation' }, uv_station: { prefix: 'uv_station' }, seawall: { prefix: 'seawall' },
  bus_stop: { prefix: 'bus_stop' }, train_station: { prefix: 'train_station' }, bridge: { prefix: 'bridge' },
  metro_station: { prefix: 'metro_station' }, marina: { prefix: 'marina' },
}

export const TREE_ASSET_KEYS = ['tree_young', 'tree_canopy', 'tree_columnar', 'tree_flowering', 'tree_palm', 'tree_ornamental']

export function resolveBuildingAsset(legacyType: string, level: number): AssetProfile | null {
  const family = BUILDING_ASSETS[legacyType]
  if (!family) return null
  const key = `${family.prefix}_lv${level}`
  return {
    legacyType,
    key,
    rootUrl: '/models/',
    fileName: `${key}.glb`,
    scale: family.scale ?? .292,
    collisionWidth: 2.69,
    collisionDepth: 2.69,
    detailDistance: 46,
    cullDistance: 86,
  }
}

export function isModelBackedBuilding(legacyType: string) { return Boolean(BUILDING_ASSETS[legacyType]) }
