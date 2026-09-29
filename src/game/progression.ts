import type { GameState, PolicyId } from '../types'

export interface MissionDefinition {
  id: string
  title: string
  description: string
  reward: number
  target: number
  value: (state: GameState) => number
  unit: string
}

const count = (state: GameState, type: string) => state.buildings.filter(building => building.type === type).length

export const MISSIONS: MissionDefinition[] = [
  { id: 'connected_streets', title: 'Nối dài khu phố', description: 'Xây mạng đường đủ lớn để mở đất phát triển.', reward: 2500, target: 12, value: state => count(state, 'road'), unit: 'ô đường' },
  { id: 'new_neighborhood', title: 'Khu dân cư đầu tiên', description: 'Tạo thêm mái ấm để các gia đình chuyển đến.', reward: 3500, target: 3, value: state => count(state, 'house') + count(state, 'apartment') * 2, unit: 'điểm nhà ở' },
  { id: 'growing_town', title: 'Thị trấn đang lớn', description: 'Duy trì nhà ở, việc làm và tiện ích để thu hút cư dân.', reward: 4500, target: 40, value: state => state.stats.population, unit: 'cư dân' },
  { id: 'local_economy', title: 'Kinh tế địa phương', description: 'Mở rộng số việc làm để ngân sách thành phố ổn định.', reward: 6000, target: 55, value: state => state.stats.jobs, unit: 'việc làm' },
  { id: 'moving_city', title: 'Thành phố chuyển động', description: 'Đầu tư đường sá và giao thông công cộng.', reward: 8000, target: 72, value: state => state.dynamics.services.mobility, unit: 'điểm di chuyển' },
  { id: 'resilient_haven', title: 'Haven kiên cường', description: 'Chuẩn bị hạ tầng để chống chịu thiên tai hiện đại.', reward: 12000, target: 62, value: state => state.dynamics.services.resilience, unit: 'điểm chống chịu' },
  { id: 'crisis_veteran', title: 'Người bảo hộ Haven', description: 'Vượt qua nhiều cuộc khủng hoảng và đưa thành phố trở lại hoạt động.', reward: 16000, target: 2, value: state => state.progress.threatsSurvived, unit: 'khủng hoảng' },
]

export const POLICIES: { id: PolicyId; name: string; description: string; upkeep: number; unlockLevel: number }[] = [
  { id: 'housing_support', name: 'Hỗ trợ an cư', description: 'Tăng tốc độ chuyển đến khi thành phố còn chỗ ở.', upkeep: 120, unlockLevel: 2 },
  { id: 'green_priority', name: 'Ưu tiên xanh', description: 'Tăng môi trường và hạnh phúc nhờ bảo dưỡng không gian xanh.', upkeep: 90, unlockLevel: 2 },
  { id: 'transit_priority', name: 'Giao thông công cộng', description: 'Tăng điểm di chuyển và sức hút của các trạm công cộng.', upkeep: 110, unlockLevel: 3 },
]

const UNLOCK_LEVELS: Record<string, number> = {
  road: 1, house: 1, market: 1, park: 1, solar: 1, water: 1,
  bus_stop: 2, apartment: 2, clinic: 2, fire: 2, drain: 2, substation: 2, shelter: 2,
  office: 3, supermarket: 3, school: 3, police: 3, security_hub: 3, mixed_use: 3, metro_station: 3, seawall: 3, uv_station: 3,
  hotel: 4, hospital: 4, university: 4, research_lab: 4, defense_tower: 4, train_station: 4, marina: 4, bridge: 4,
}

export const CITY_LEVEL_THRESHOLDS = [0, 30, 100, 250, 500, 900]

export function cityLevel(population: number) {
  let level = 1
  for (let index = 1; index < CITY_LEVEL_THRESHOLDS.length; index++) if (population >= CITY_LEVEL_THRESHOLDS[index]) level = index + 1
  return level
}

export function levelProgress(population: number) {
  const level = cityLevel(population)
  const start = CITY_LEVEL_THRESHOLDS[level - 1] ?? 0
  const target = CITY_LEVEL_THRESHOLDS[level] ?? start + 500
  return { level, start, target, current: population - start, required: target - start, percent: Math.min(100, (population - start) / Math.max(1, target - start) * 100) }
}

export function unlockLevel(buildingType: string) { return UNLOCK_LEVELS[buildingType] ?? 1 }
export function isUnlocked(buildingType: string, level: number) { return level >= unlockLevel(buildingType) }
export function activeMission(state: GameState) { return MISSIONS.find(mission => !state.progress.claimedMissions.includes(mission.id)) }
export function missionValue(state: GameState, mission: MissionDefinition) { return Math.min(mission.target, Math.round(mission.value(state))) }
export function policyUpkeep(state: GameState) { return POLICIES.filter(policy => state.progress.activePolicies.includes(policy.id)).reduce((sum, policy) => sum + policy.upkeep, 0) }
