import type { GameState, GridPoint, PlacedBuilding } from '../types'

export interface ServiceCoverage { radius: number; color: string; label: string; buildings: PlacedBuilding[] }

const SERVICE_RADII: Record<string, { tiles: number; color: string; label: string }> = {
  clinic: { tiles: 4, color: '#54d8a8', label: 'Y tế cơ sở' },
  hospital: { tiles: 6.5, color: '#3ec7c9', label: 'Bệnh viện' },
  police: { tiles: 5, color: '#5f9fe0', label: 'An ninh' },
  fire: { tiles: 5, color: '#ef7a52', label: 'Cứu hỏa' },
  school: { tiles: 4, color: '#e6b95c', label: 'Giáo dục' },
  university: { tiles: 6, color: '#9d8fd6', label: 'Đại học' },
  uv_station: { tiles: 4.5, color: '#9d8fd6', label: 'Vùng lọc UV' },
  drain: { tiles: 4, color: '#3ec7c9', label: 'Thoát nước' },
  seawall: { tiles: 3.5, color: '#5f9fe0', label: 'Kè chắn sóng' },
  shelter: { tiles: 4, color: '#ef7a52', label: 'Trú ẩn' },
  security_hub: { tiles: 6, color: '#5f9fe0', label: 'An ninh tổng hợp' },
  research_lab: { tiles: 7, color: '#54d8a8', label: 'Nghiên cứu dịch tễ' },
  defense_tower: { tiles: 7, color: '#e45f4f', label: 'Phòng vệ' },
}

/** Effective coverage radius in tiles for a placed building (level upgrades widen the reach). */
export function serviceReach(type: string, level = 1): number {
  const base = SERVICE_RADII[type]?.tiles ?? 0
  return base > 0 ? base + (level - 1) * .5 : 0
}

export function serviceLabel(type: string): string { return SERVICE_RADII[type]?.label ?? type }

export function serviceOverlays(state: GameState): ServiceCoverage[] {
  const groups = new Map<string, PlacedBuilding[]>()
  state.buildings.forEach(building => {
    if (!SERVICE_RADII[building.type]) return
    const list = groups.get(building.type) ?? []
    list.push(building)
    groups.set(building.type, list)
  })
  return [...groups.entries()].map(([type, buildings]) => ({
    radius: SERVICE_RADII[type].tiles,
    color: SERVICE_RADII[type].color,
    label: SERVICE_RADII[type].label,
    buildings,
  }))
}

export function coverageAt(point: GridPoint, state: GameState, kind: keyof typeof SERVICE_RADII | 'medical' | 'safety'): boolean {
  const types = kind === 'medical' ? ['clinic', 'hospital'] : kind === 'safety' ? ['police', 'fire'] : [kind]
  const reach = Math.max(...types.map(type => SERVICE_RADII[type]?.tiles ?? 0))
  return state.buildings.some(building => types.includes(building.type) && Math.hypot(building.x - point.x, building.y - point.y) <= reach + (building.level - 1) * .5)
}

export interface ShortageCause { title: string; detail: string }

/** Per-tile coverage test used by warning icons and the "outside hospital zone" tooltips. */
export function uncoveredBy(point: GridPoint, state: GameState, kind: 'medical' | 'safety'): PlacedBuilding | null {
  const types = kind === 'medical' ? ['clinic', 'hospital'] : ['police', 'fire']
  const covered = state.buildings.some(building => types.includes(building.type) && Math.hypot(building.x - point.x, building.y - point.y) <= serviceReach(building.type, building.level))
  if (covered) return null
  return state.buildings.find(building => building.x === point.x && building.y === point.y) ?? null
}

export function shortageCauses(state: GameState): ShortageCause[] {
  const causes: ShortageCause[] = []
  if (state.stats.powerUse > state.stats.power) causes.push({ title: 'Thiếu điện', detail: `Thiếu ${Math.round(state.stats.powerUse - state.stats.power)} MW · xây thêm điện mặt trời hoặc trạm biến áp` })
  if (state.stats.waterUse > state.stats.water) causes.push({ title: 'Thiếu nước', detail: `Thiếu ${Math.round(state.stats.waterUse - state.stats.water)} ML · nâng cấp tháp nước` })
  if (state.stats.population >= state.stats.housingCapacity && state.dynamics.pressures.housing > 40) causes.push({ title: 'Thiếu chỗ ở', detail: 'Hết chỗ ở trống · xây thêm nhà dân hoặc chung cư' })
  if (state.dynamics.services.health < 45) causes.push({ title: 'Phủ y tế thấp', detail: 'Nhiều khu ngoài vùng bệnh viện/phòng khám' })
  if (state.dynamics.services.safety < 45) causes.push({ title: 'Phủ an ninh thấp', detail: 'Thêm đồn cảnh sát hoặc trạm cứu hỏa' })
  if (state.dynamics.services.education < 40) causes.push({ title: 'Thiếu trường học', detail: 'Học sinh vượt quá sức chứa giáo dục' })
  if (state.dynamics.services.mobility < 40) causes.push({ title: 'Ùn tắc tiềm ẩn', detail: 'Mạng đường chưa theo kịp mật độ · mở thêm trục hoặc trạm xe buýt' })
  return causes.slice(0, 4)
}
