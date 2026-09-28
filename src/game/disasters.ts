import { BUILDING_MAP } from '../data/buildings'
import type { DisasterKind, GameState, PlacedBuilding } from '../types'

export const DISASTERS: Record<DisasterKind, { name: string; warning: string; active: string; preparation: string; severity: number }> = {
  flood: { name: 'Lũ đô thị', warning: 'Mưa lớn và nước dâng đang đến', active: 'Nhiều khu phố đang ngập', preparation: 'Trạm thoát nước, công viên và hồ điều tiết', severity: 9 },
  uv: { name: 'UV cực đoan', warning: 'Chỉ số UV sắp vượt mức an toàn', active: 'Bức xạ UV đang ở mức nguy hiểm', preparation: 'Trạm lọc UV có điện và phủ đủ khu dân cư', severity: 8 },
  storm: { name: 'Siêu bão', warning: 'Gió mạnh đang tiến gần thành phố', active: 'Siêu bão đang quét qua thành phố', preparation: 'Nâng cấp nhà, lưới điện và dịch vụ khẩn cấp', severity: 10 },
  wave: { name: 'Sóng lớn', warning: 'Triều cường bất thường ngoài khơi', active: 'Sóng lớn đang đánh vào bờ biển', preparation: 'Kè đá và chắn sóng dọc vùng ven biển', severity: 11 },
}

export function applyDisasterDamage(state: GameState): PlacedBuilding[] {
  const disaster = state.disaster
  if (!disaster) return state.buildings
  return state.buildings.map(building => {
    const def = BUILDING_MAP[building.type]
    if (building.type === 'road') return building
    const exposed = exposure(disaster.kind, building)
    if (!exposed) return building
    const protectedHere = hasProtection(state, building, disaster.kind)
    const levelDefense = disaster.kind === 'storm' ? (building.level - 1) * 2.2 : (building.level - 1) * .8
    const resilience = (def.resilience ?? 0) + levelDefense + (protectedHere ? 12 : 0)
    const damage = Math.max(1, (disaster.severity * 2.4 - resilience) * exposed)
    return { ...building, health: Math.max(18, Math.round(building.health - damage)) }
  })
}

export function hasProtection(state: GameState, target: PlacedBuilding, kind: DisasterKind) {
  if (kind === 'storm') return target.level >= 4
  const protectionKind = kind === 'flood' ? 'flood' : kind
  return state.buildings.some(source => {
    const def = BUILDING_MAP[source.type]
    const protectsFlood = kind === 'flood' && (source.type === 'drain' || source.type === 'park')
    if (def.protection !== protectionKind && !protectsFlood) return false
    if (kind === 'uv' && state.stats.powerUse > state.stats.power) return false
    const radius = def.protectionRadius ?? (source.type === 'drain' ? 4 : 2.5)
    return Math.hypot(source.x - target.x, source.y - target.y) <= radius + source.level * .45
  })
}

function exposure(kind: DisasterKind, building: PlacedBuilding) {
  if (kind === 'wave') return building.x + building.y > 21 ? 1 : 0
  if (kind === 'flood') return building.x + building.y > 17 ? 1 : .65
  return 1
}
