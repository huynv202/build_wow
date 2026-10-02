import type { GameState, PolicyId } from '../types'

export interface MissionDefinition {
  id: string
  title: string
  description: string
  reward: number
  target: number
  value: (state: GameState) => number
  unit: string
  steps: MissionStep[]
}

export interface MissionStep {
  id: string
  title: string
  description: string
  target: number
  value: (state: GameState) => number
  unit: string
  buildType?: string
}

const count = (state: GameState, type: string) => state.buildings.filter(building => building.type === type).length

export const MISSIONS: MissionDefinition[] = [
  { id: 'connected_streets', title: 'Nối dài khu phố', description: 'Mở bảng Xây dựng, chọn Đường và kéo trên bản đồ để nối khu dân cư với đất trống.', reward: 2500, target: 12, value: state => count(state, 'road'), unit: 'ô đường', steps: [
    { id: 'roads', title: 'Tạo trục đường đầu tiên', description: 'Nhấn B, chọn Đường nội đô rồi giữ chuột kéo thành một đoạn liên tục.', target: 12, value: state => count(state, 'road'), unit: 'ô', buildType: 'road' },
  ] },
  { id: 'new_neighborhood', title: 'Khu dân cư đầu tiên', description: 'Nhà ở chỉ thu hút cư dân khi còn đủ điện, nước và được nối với đường.', reward: 3500, target: 3, value: state => count(state, 'house') + count(state, 'apartment') * 2, unit: 'điểm nhà ở', steps: [
    { id: 'homes', title: 'Xây thêm mái ấm', description: 'Đặt nhà cạnh đường. Mỗi nhà tạo chỗ ở nhưng đồng thời tiêu thụ điện và nước.', target: 3, value: state => count(state, 'house') + count(state, 'apartment') * 2, unit: 'điểm', buildType: 'house' },
    { id: 'power', title: 'Giữ điện không quá tải', description: 'Xây hoặc nâng cấp nguồn điện nếu nhu cầu vượt công suất.', target: 1, value: state => state.stats.power >= state.stats.powerUse ? 1 : 0, unit: 'mạng ổn định', buildType: 'solar' },
    { id: 'water', title: 'Bảo đảm nước sạch', description: 'Nguồn nước phải đáp ứng toàn bộ khu dân cư mới.', target: 1, value: state => state.stats.water >= state.stats.waterUse ? 1 : 0, unit: 'mạng ổn định', buildType: 'water' },
  ] },
  { id: 'supply_foundation', title: 'Tự chủ nhu yếu phẩm', description: 'Ghép khai thác, chế biến và kho vận thành một chuỗi thay vì xây các công trình rời rạc.', reward: 4200, target: 3, value: state => ['logging_camp', 'farm', 'fishing_dock', 'quarry', 'sawmill', 'seafood_factory', 'workshop', 'warehouse'].reduce((sum, type) => sum + count(state, type), 0), unit: 'cơ sở sản xuất', steps: [
    { id: 'producer', title: 'Tạo nguồn nguyên liệu', description: 'Chọn lâm nghiệp, nông trại, bến cá hoặc mỏ để tạo hàng hóa thô.', target: 1, value: state => ['logging_camp', 'farm', 'fishing_dock', 'quarry'].reduce((sum, type) => sum + count(state, type), 0), unit: 'cơ sở', buildType: 'fishing_dock' },
    { id: 'processor', title: 'Tăng giá trị hàng hóa', description: 'Xưởng biến nguyên liệu thô thành hàng có giá bán và giá hợp đồng cao hơn.', target: 1, value: state => ['sawmill', 'seafood_factory', 'workshop'].reduce((sum, type) => sum + count(state, type), 0), unit: 'xưởng', buildType: 'seafood_factory' },
    { id: 'storage', title: 'Ngăn chuỗi bị nghẽn', description: 'Kho hàng tăng sức chứa; cơ sở sẽ dừng nếu tổng kho bị đầy.', target: 1, value: state => count(state, 'warehouse'), unit: 'kho', buildType: 'warehouse' },
  ] },
  { id: 'blue_economy', title: 'Hơi thở của biển', description: 'Đưa cá từ đội tàu qua chế biến lạnh rồi tới nơi bán. Hải sản chế biến giúp chợ và cảng kiếm nhiều tiền hơn.', reward: 5600, target: 3, value: state => Math.min(1, count(state, 'fishing_dock')) + Math.min(1, count(state, 'seafood_factory')) + Math.min(1, count(state, 'market') + count(state, 'supermarket') + count(state, 'marina')), unit: 'mắt xích', steps: [
    { id: 'fleet', title: 'Tổ chức đội tàu cá', description: 'Bến cá cần lao động, điện và nguồn cá khỏe để đưa cá tươi vào kho.', target: 1, value: state => count(state, 'fishing_dock'), unit: 'bến', buildType: 'fishing_dock' },
    { id: 'cold-chain', title: 'Xây xưởng chế biến', description: 'Xưởng dùng 6 cá để tạo 4 hải sản chế biến có giá trị cao hơn.', target: 1, value: state => count(state, 'seafood_factory'), unit: 'xưởng', buildType: 'seafood_factory' },
    { id: 'outlet', title: 'Mở đầu ra tiêu thụ', description: 'Chợ bán cho cư dân; siêu thị bán quy mô lớn; bến tàu xuất khẩu với biên lợi nhuận cao nhất.', target: 1, value: state => count(state, 'market') + count(state, 'supermarket') + count(state, 'marina'), unit: 'đầu ra', buildType: 'market' },
    { id: 'operating', title: 'Đưa dây chuyền vào hoạt động', description: 'Nếu bị dừng, kiểm tra lao động, điện, nước, nguyên liệu và sức chứa kho trong bảng Kinh tế.', target: 2, value: state => Object.values(state.economy.buildingOperations).filter(operation => ['fishing_dock', 'seafood_factory', 'market', 'supermarket', 'marina'].includes(operation.type) && operation.efficiency > 0).length, unit: 'cơ sở chạy' },
  ] },
  { id: 'growing_town', title: 'Thị trấn đang lớn', description: 'Duy trì chỗ ở, việc làm và tiện ích để dân số tăng bền vững.', reward: 4500, target: 40, value: state => state.stats.population, unit: 'cư dân', steps: [
    { id: 'capacity', title: 'Chuẩn bị đủ nhà ở', description: 'Dân số ngừng tăng ngay khi hết chỗ ở.', target: 50, value: state => state.stats.housingCapacity, unit: 'chỗ ở', buildType: 'house' },
    { id: 'population', title: 'Thu hút cư dân', description: 'Giữ việc làm, điện, nước và hạnh phúc ổn định để cư dân chuyển đến mỗi ngày.', target: 40, value: state => state.stats.population, unit: 'cư dân' },
  ] },
  { id: 'local_economy', title: 'Kinh tế có việc làm thật', description: 'Dân cư tạo lực lượng lao động; cơ sở có người làm mới sản xuất và trả thuế.', reward: 6000, target: 24, value: state => state.economy.workforce.employed, unit: 'lao động', steps: [
    { id: 'workers', title: 'Đưa cư dân vào việc làm', description: 'Xây cơ sở sản xuất và thương mại, sau đó đặt ưu tiên lao động cho mắt xích quan trọng.', target: 24, value: state => state.economy.workforce.employed, unit: 'lao động', buildType: 'market' },
    { id: 'positive-cashflow', title: 'Cân bằng dòng tiền', description: 'Bán hàng và thuế phải bù được lương, bảo trì và chính sách.', target: 1, value: state => state.stats.income >= 0 ? 1 : 0, unit: 'ngân sách dương' },
  ] },
  { id: 'trade_network', title: 'Thành phố giao thương', description: 'Tích hàng trong kho rồi giao đúng đơn để nhận tiền mặt và uy tín.', reward: 7000, target: 3, value: state => state.economy.trade.completed, unit: 'hợp đồng', steps: [
    { id: 'warehouse', title: 'Mở rộng kho giao thương', description: 'Kho lớn giúp giữ đủ nhiều loại hàng cho các đơn hàng hỗn hợp.', target: 1, value: state => count(state, 'warehouse'), unit: 'kho', buildType: 'warehouse' },
    { id: 'contracts', title: 'Giao ba hợp đồng', description: 'Mở bảng Kinh tế, xem số lượng còn thiếu và bấm Giao hàng khi mọi mặt hàng đã đủ.', target: 3, value: state => state.economy.trade.completed, unit: 'hợp đồng' },
  ] },
  { id: 'moving_city', title: 'Thành phố chuyển động', description: 'Kết hợp đường bộ với giao thông công cộng để cư dân tiếp cận việc làm và dịch vụ.', reward: 8000, target: 72, value: state => state.dynamics.services.mobility, unit: 'điểm di chuyển', steps: [
    { id: 'road-network', title: 'Mở rộng mạng đường', description: 'Đường tạo mặt bằng xây dựng và tăng năng lực lưu thông cơ bản.', target: 20, value: state => count(state, 'road'), unit: 'ô', buildType: 'road' },
    { id: 'transit', title: 'Bổ sung vận tải công cộng', description: 'Trạm xe buýt và các ga giúp nâng điểm di chuyển nhanh hơn mở đường đơn thuần.', target: 1, value: state => count(state, 'bus_stop') + count(state, 'metro_station') + count(state, 'train_station'), unit: 'trạm', buildType: 'bus_stop' },
    { id: 'mobility', title: 'Đạt mạng lưới thông suốt', description: 'Theo dõi lớp Giao thông để cân đối mật độ dân số và năng lực vận tải.', target: 72, value: state => state.dynamics.services.mobility, unit: 'điểm' },
  ] },
  { id: 'resilient_haven', title: 'Haven kiên cường', description: 'Mỗi nguy cơ cần đúng loại công trình bảo vệ; không có một công trình nào chống được mọi thứ.', reward: 12000, target: 62, value: state => state.dynamics.services.resilience, unit: 'điểm chống chịu', steps: [
    { id: 'flood', title: 'Chuẩn bị chống ngập', description: 'Trạm thoát nước giảm ngập đô thị; công viên giúp thấm nước mưa.', target: 1, value: state => count(state, 'drain'), unit: 'trạm', buildType: 'drain' },
    { id: 'coast', title: 'Bảo vệ bờ biển', description: 'Kè chắn sóng bảo vệ các công trình ven bờ trong bán kính hoạt động.', target: 1, value: state => count(state, 'seawall'), unit: 'kè', buildType: 'seawall' },
    { id: 'resilience', title: 'Nâng sức chống chịu tổng thể', description: 'Kết hợp cứu hỏa, y tế, an ninh, điện dự phòng và công trình chuyên dụng.', target: 62, value: state => state.dynamics.services.resilience, unit: 'điểm' },
  ] },
  { id: 'crisis_veteran', title: 'Người bảo hộ Haven', description: 'Theo dõi cảnh báo, xây đúng vùng bảo vệ và huy động lực lượng khi khủng hoảng bắt đầu.', reward: 16000, target: 2, value: state => state.progress.threatsSurvived, unit: 'khủng hoảng', steps: [
    { id: 'readiness', title: 'Duy trì lực lượng phản ứng', description: 'Cảnh sát, cứu hỏa, y tế và nơi trú ẩn giúp giảm thiệt hại trên toàn thành phố.', target: 55, value: state => Math.round((state.dynamics.services.health + state.dynamics.services.safety + state.dynamics.services.defense) / 3), unit: 'điểm sẵn sàng', buildType: 'police' },
    { id: 'survive', title: 'Vượt qua hai khủng hoảng', description: 'Sau giai đoạn cảnh báo và hoạt động, sửa công trình hư hại để thành phố phục hồi.', target: 2, value: state => state.progress.threatsSurvived, unit: 'khủng hoảng' },
  ] },
]

export const POLICIES: { id: PolicyId; name: string; description: string; upkeep: number; unlockLevel: number }[] = [
  { id: 'housing_support', name: 'Hỗ trợ an cư', description: 'Tăng tốc độ chuyển đến khi thành phố còn chỗ ở.', upkeep: 120, unlockLevel: 2 },
  { id: 'green_priority', name: 'Ưu tiên xanh', description: 'Tăng môi trường và hạnh phúc nhờ bảo dưỡng không gian xanh.', upkeep: 90, unlockLevel: 2 },
  { id: 'transit_priority', name: 'Giao thông công cộng', description: 'Tăng điểm di chuyển và sức hút của các trạm công cộng.', upkeep: 110, unlockLevel: 3 },
]

const UNLOCK_LEVELS: Record<string, number> = {
  road: 1, house: 1, market: 1, park: 1, solar: 1, water: 1, logging_camp: 1, farm: 1, fishing_dock: 1, seafood_factory: 1, warehouse: 1, quarry: 1,
  bus_stop: 2, apartment: 2, clinic: 2, fire: 2, drain: 2, substation: 2, shelter: 2, wind: 2, sawmill: 2, workshop: 2,
  office: 3, supermarket: 3, school: 3, police: 3, security_hub: 3, mixed_use: 3, metro_station: 3, seawall: 3, uv_station: 3, ferris_wheel: 3, civic_tower: 3,
  hotel: 4, hospital: 4, university: 4, research_lab: 4, defense_tower: 4, train_station: 4, marina: 4, bridge: 4, stadium: 4, airport_terminal: 4,
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
export function missionStepValue(state: GameState, step: MissionStep) { return Math.min(step.target, Math.round(step.value(state))) }
export function missionComplete(state: GameState, mission: MissionDefinition) { return missionValue(state, mission) >= mission.target && mission.steps.every(step => missionStepValue(state, step) >= step.target) }
export function policyUpkeep(state: GameState) { return POLICIES.filter(policy => state.progress.activePolicies.includes(policy.id)).reduce((sum, policy) => sum + policy.upkeep, 0) }
