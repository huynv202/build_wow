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

export interface SupportAssetProfile {
  key: string
  rootUrl: string
  fileName: string
  scale: number
  detailDistance: number
  cullDistance: number
}

const BUILDING_ASSETS: Record<string, { prefix: string; scale?: number }> = {
  house: { prefix: 'house', scale: .3 }, apartment: { prefix: 'apartment' }, mixed_use: { prefix: 'mixed_use' },
  market: { prefix: 'market' }, office: { prefix: 'office' }, supermarket: { prefix: 'supermarket' }, hotel: { prefix: 'hotel' },
  clinic: { prefix: 'clinic' }, fire: { prefix: 'fire' }, hospital: { prefix: 'hospital' }, police: { prefix: 'police' },
  school: { prefix: 'school' }, university: { prefix: 'university' }, water: { prefix: 'water' }, solar: { prefix: 'solar' },
  drain: { prefix: 'drain' }, substation: { prefix: 'substation' }, uv_station: { prefix: 'uv_station' }, seawall: { prefix: 'seawall' },
  wind: { prefix: 'wind' }, park: { prefix: 'park' }, shelter: { prefix: 'shelter' }, security_hub: { prefix: 'security_hub' },
  research_lab: { prefix: 'research_lab' }, defense_tower: { prefix: 'defense_tower' },
  bus_stop: { prefix: 'bus_stop' }, train_station: { prefix: 'train_station' }, bridge: { prefix: 'bridge' },
  metro_station: { prefix: 'metro_station' }, marina: { prefix: 'marina' },
  civic_tower: { prefix: 'civic_tower' }, airport_terminal: { prefix: 'airport_terminal' }, ferris_wheel: { prefix: 'ferris_wheel' }, stadium: { prefix: 'stadium' },
}

export const TREE_ASSET_KEYS = ['tree_young', 'tree_canopy', 'tree_columnar', 'tree_flowering', 'tree_palm', 'tree_ornamental']

export const SUPPORT_ASSETS = {
  prop_bench: { scale: .55, detailDistance: 34, cullDistance: 52 },
  prop_street_light: { scale: .6, detailDistance: 38, cullDistance: 58 },
  prop_traffic_light: { scale: .62, detailDistance: 38, cullDistance: 58 },
  prop_bin: { scale: .56, detailDistance: 28, cullDistance: 44 },
  prop_bike_rack: { scale: .5, detailDistance: 30, cullDistance: 46 },
  prop_hydrant: { scale: .58, detailDistance: 30, cullDistance: 46 },
  prop_bollard: { scale: .65, detailDistance: 26, cullDistance: 42 },
  prop_planter: { scale: .55, detailDistance: 32, cullDistance: 48 },
  vehicle_car: { scale: .48, detailDistance: 46, cullDistance: 72 },
  vehicle_bus: { scale: .42, detailDistance: 50, cullDistance: 78 },
  vehicle_fire_engine: { scale: .46, detailDistance: 50, cullDistance: 78 },
} as const

export type SupportAssetKey = keyof typeof SUPPORT_ASSETS

export const STREET_PROP_ASSET_KEYS: SupportAssetKey[] = [
  'prop_bench', 'prop_street_light', 'prop_traffic_light', 'prop_bin',
  'prop_bike_rack', 'prop_hydrant', 'prop_bollard', 'prop_planter',
]

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

export function resolveSupportAsset(key: SupportAssetKey): SupportAssetProfile {
  const profile = SUPPORT_ASSETS[key]
  return {
    key,
    rootUrl: '/models/',
    fileName: `${key}.glb`,
    scale: profile.scale,
    detailDistance: profile.detailDistance,
    cullDistance: profile.cullDistance,
  }
}
