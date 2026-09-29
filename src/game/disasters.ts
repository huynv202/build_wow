import { BUILDING_MAP } from '../data/buildings'
import type { DisasterKind, GameState, PlacedBuilding } from '../types'

export interface ThreatDefinition {
  name: string
  icon: string
  warning: string
  active: string
  preparation: string
  severity: number
  category: 'climate' | 'health' | 'security' | 'infrastructure'
}

export const DISASTERS: Record<DisasterKind, ThreatDefinition> = {
  flood: { name: 'Lũ đô thị', icon: '≋', warning: 'Mưa lớn và nước dâng đang đến', active: 'Nhiều khu phố đang ngập', preparation: 'Trạm thoát nước, công viên và hồ điều tiết', severity: 9, category: 'climate' },
  uv: { name: 'UV cực đoan', icon: '☀', warning: 'Chỉ số UV sắp vượt mức an toàn', active: 'Bức xạ UV đang ở mức nguy hiểm', preparation: 'Trạm lọc UV có điện và phủ đủ khu dân cư', severity: 8, category: 'climate' },
  storm: { name: 'Siêu bão', icon: '◈', warning: 'Gió mạnh đang tiến gần thành phố', active: 'Siêu bão đang quét qua thành phố', preparation: 'Nâng cấp nhà, lưới điện và dịch vụ khẩn cấp', severity: 10, category: 'climate' },
  wave: { name: 'Sóng lớn', icon: '≈', warning: 'Triều cường bất thường ngoài khơi', active: 'Sóng lớn đang đánh vào bờ biển', preparation: 'Kè đá và chắn sóng dọc vùng ven biển', severity: 11, category: 'climate' },
  epidemic: { name: 'Dịch bệnh', icon: '✚', warning: 'Số ca bệnh bất thường đang tăng nhanh', active: 'Hệ thống y tế đang chịu áp lực dịch bệnh', preparation: 'Phòng khám, bệnh viện và viện nghiên cứu', severity: 9, category: 'health' },
  blackout: { name: 'Mất điện diện rộng', icon: 'ϟ', warning: 'Lưới điện xuất hiện dao động nguy hiểm', active: 'Nhiều khu phố đang chìm trong bóng tối', preparation: 'Nguồn điện dự phòng và trạm biến áp', severity: 8, category: 'infrastructure' },
  zombie: { name: 'Dịch zombie', icon: '☣', warning: 'Các ca nhiễm hung hãn xuất hiện ngoài vành đai', active: 'Đám đông nhiễm bệnh đang tràn vào thành phố', preparation: 'Cảnh sát, y tế, hầm trú ẩn và trung tâm an ninh', severity: 12, category: 'security' },
  monster: { name: 'Quái thú khổng lồ', icon: '⟁', warning: 'Cảm biến phát hiện sinh vật khổng lồ đang tiếp cận', active: 'Quái thú đang tấn công hạ tầng trọng yếu', preparation: 'Tháp phòng vệ, cảnh sát và công nghệ nghiên cứu', severity: 15, category: 'security' },
}

export function availableThreats(level: number): DisasterKind[] {
  const kinds: DisasterKind[] = ['flood', 'storm', 'blackout']
  if (level >= 2) kinds.push('uv', 'wave', 'epidemic')
  if (level >= 3) kinds.push('zombie')
  if (level >= 4) kinds.push('monster')
  return kinds
}

export function threatReadiness(state: GameState, kind: DisasterKind) {
  const count = (type: string) => state.buildings.filter(building => building.type === type).reduce((sum, building) => sum + building.level, 0)
  const powerMargin = state.stats.power > 0 ? Math.max(0, (state.stats.power - state.stats.powerUse) / state.stats.power * 100) : 0
  let score = state.dynamics.services.resilience * .22
  if (kind === 'flood') score += count('drain') * 18 + count('park') * 4
  if (kind === 'uv') score += count('uv_station') * 24 + Math.min(15, powerMargin)
  if (kind === 'storm') score += count('fire') * 10 + count('substation') * 15 + state.buildings.filter(building => building.level >= 4).length * 3
  if (kind === 'wave') score += count('seawall') * 23 + count('marina') * 7
  if (kind === 'epidemic') score += count('clinic') * 12 + count('hospital') * 24 + count('research_lab') * 20 + state.dynamics.services.health * .25
  if (kind === 'blackout') score += count('substation') * 22 + count('solar') * 9 + Math.min(22, powerMargin)
  if (kind === 'zombie') score += count('police') * 14 + count('security_hub') * 24 + count('shelter') * 12 + state.dynamics.services.health * .16
  if (kind === 'monster') score += count('defense_tower') * 28 + count('research_lab') * 13 + count('security_hub') * 8 + count('police') * 5
  score = clamp(Math.round(score))
  return { score, status: score >= 75 ? 'Sẵn sàng cao' : score >= 50 ? 'Có thể ứng phó' : score >= 30 ? 'Còn lỗ hổng' : 'Nguy cơ nghiêm trọng' }
}

export function threatPopulationPenalty(state: GameState) {
  const disaster = state.disaster
  if (!disaster || disaster.phase !== 'active') return 0
  const base: Record<DisasterKind, number> = { flood: 2, uv: 2, storm: 3, wave: 2, epidemic: 4, blackout: 1, zombie: 5, monster: 3 }
  const readiness = threatReadiness(state, disaster.kind).score + (disaster.response ?? 0)
  return Math.max(0, Math.round(base[disaster.kind] * (1 - Math.min(90, readiness) / 110)))
}

export function applyDisasterDamage(state: GameState): PlacedBuilding[] {
  const disaster = state.disaster
  if (!disaster || disaster.kind === 'epidemic' || disaster.kind === 'blackout') return state.buildings
  return state.buildings.map(building => {
    const definition = BUILDING_MAP[building.type]
    if (building.type === 'road') return building
    const exposed = exposure(disaster.kind, building)
    if (!exposed) return building
    const protectedHere = hasProtection(state, building, disaster.kind)
    const levelDefense = disaster.kind === 'storm' ? (building.level - 1) * 2.2 : (building.level - 1) * .8
    const response = (disaster.response ?? 0) * .28
    const resilience = (definition.resilience ?? 0) + levelDefense + response + (protectedHere ? disaster.kind === 'monster' ? 18 : 12 : 0)
    const damage = Math.max(1, (disaster.severity * 2.4 - resilience) * exposed)
    return { ...building, health: Math.max(18, Math.round(building.health - damage)) }
  })
}

export function hasProtection(state: GameState, target: PlacedBuilding, kind: DisasterKind) {
  if (kind === 'storm') return target.level >= 4
  const sourceTypes: Partial<Record<DisasterKind, string[]>> = {
    flood: ['drain', 'park'], uv: ['uv_station'], wave: ['seawall'], epidemic: ['clinic', 'hospital', 'research_lab'],
    blackout: ['substation', 'solar'], zombie: ['police', 'clinic', 'hospital', 'shelter', 'security_hub'], monster: ['defense_tower', 'security_hub', 'police'],
  }
  return state.buildings.some(source => {
    if (!sourceTypes[kind]?.includes(source.type)) return false
    if ((kind === 'uv' || kind === 'monster') && state.stats.powerUse > state.stats.power) return false
    const definition = BUILDING_MAP[source.type]
    const radius = definition.protectionRadius ?? (source.type === 'drain' ? 4 : source.type === 'police' ? 4.5 : 2.5)
    return Math.hypot(source.x - target.x, source.y - target.y) <= radius + source.level * .45
  })
}

function exposure(kind: DisasterKind, building: PlacedBuilding) {
  if (kind === 'wave') return building.x + building.y > 21 ? 1 : 0
  if (kind === 'flood') return building.x + building.y > 17 ? 1 : .65
  if (kind === 'zombie') return ['house', 'apartment', 'mixed_use', 'market', 'supermarket'].includes(building.type) ? 1.15 : .75
  if (kind === 'monster') return ['defense_tower', 'security_hub', 'police'].includes(building.type) ? .55 : 1.2
  return 1
}

function clamp(value: number, min = 0, max = 100) { return Math.max(min, Math.min(max, value)) }
