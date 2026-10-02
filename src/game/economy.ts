import { BUILDING_MAP } from '../data/buildings'
import { policyUpkeep } from './progression'
import type { BuildingOperation, BuildingWorkSetting, EconomyLedger, EconomyState, GameState, Inventory, ResourceId, TradeContract, WorkforcePriority } from '../types'

interface EconomyProfile {
  workers: number
  wage: number
  inputs?: Partial<Inventory>
  optionalInputs?: Partial<Inventory>
  outputs?: Partial<Inventory>
  revenue?: number
  optionalRevenue?: number
  channel?: 'sales' | 'exports'
  naturalResource?: 'forest' | 'fish' | 'ore'
  storage?: number
  label: string
}

const RESOURCE_LABELS: Record<ResourceId, string> = { logs: 'gỗ tròn', planks: 'ván gỗ', fish: 'cá', seafood: 'hải sản chế biến', food: 'lương thực', ore: 'quặng', tools: 'công cụ' }
const EMPTY_LEDGER: EconomyLedger = { sales: 0, exports: 0, householdTax: 0, businessTax: 0, starterGrant: 0, wages: 0, upkeep: 0, policies: 0, imports: 0, net: 0 }
const DEFAULT_SETTING: BuildingWorkSetting = { priority: 1, paused: false }
const CONTRACT_TEMPLATES: Omit<TradeContract, 'id'>[] = [
  { title: 'Vật liệu dựng nhà', description: 'Khu định cư lân cận cần ván gỗ để tái thiết.', requirements: { planks: 8 }, reward: 1350, reputation: 2 },
  { title: 'Tiếp tế ven biển', description: 'Đoàn cứu trợ đặt mua thực phẩm dự trữ.', requirements: { fish: 7, food: 10 }, reward: 1750, reputation: 3 },
  { title: 'Hải sản tiêu chuẩn xuất khẩu', description: 'Chuỗi nhà hàng vùng trả giá cao cho hải sản đã qua chế biến lạnh.', requirements: { seafood: 8 }, reward: 2650, reputation: 4 },
  { title: 'Dụng cụ công trường', description: 'Nhà thầu vùng cần công cụ sản xuất chất lượng cao.', requirements: { tools: 6 }, reward: 2300, reputation: 4 },
  { title: 'Đơn hàng hỗn hợp', description: 'Thương nhân trả giá tốt cho một lô hàng đa dạng.', requirements: { logs: 8, ore: 6, food: 6 }, reward: 1950, reputation: 3 },
]

// Profiles are intentionally data-driven so later production chains only need new entries.
export const ECONOMY_PROFILES: Record<string, EconomyProfile> = {
  logging_camp: { workers: 5, wage: 18, outputs: { logs: 10 }, naturalResource: 'forest', label: 'Khai thác gỗ' },
  farm: { workers: 6, wage: 19, outputs: { food: 11 }, label: 'Thu hoạch lương thực' },
  fishing_dock: { workers: 5, wage: 20, outputs: { fish: 9 }, naturalResource: 'fish', label: 'Đánh bắt ven bờ' },
  seafood_factory: { workers: 6, wage: 25, inputs: { fish: 6 }, outputs: { seafood: 4 }, label: 'Chế biến và bảo quản hải sản' },
  quarry: { workers: 6, wage: 23, outputs: { ore: 8 }, naturalResource: 'ore', label: 'Khai thác quặng' },
  sawmill: { workers: 6, wage: 24, inputs: { logs: 8 }, outputs: { planks: 5 }, label: 'Xẻ gỗ thành ván' },
  workshop: { workers: 7, wage: 29, inputs: { ore: 4, planks: 2 }, outputs: { tools: 3 }, label: 'Chế tạo công cụ' },
  warehouse: { workers: 2, wage: 17, storage: 120, label: 'Điều phối kho vận' },
  market: { workers: 4, wage: 22, inputs: { fish: 1.5, food: 2.5, planks: .5 }, optionalInputs: { seafood: 1.2 }, revenue: 360, optionalRevenue: 260, channel: 'sales', label: 'Bán hàng cho cư dân' },
  supermarket: { workers: 8, wage: 24, inputs: { fish: 2, food: 4 }, optionalInputs: { seafood: 2 }, revenue: 620, optionalRevenue: 420, channel: 'sales', label: 'Phân phối hàng tiêu dùng' },
  mixed_use: { workers: 7, wage: 28, revenue: 300, channel: 'sales', label: 'Dịch vụ khu phố' },
  office: { workers: 10, wage: 34, revenue: 520, channel: 'sales', label: 'Dịch vụ doanh nghiệp' },
  hotel: { workers: 10, wage: 29, inputs: { food: 2 }, revenue: 560, channel: 'sales', label: 'Dịch vụ du lịch' },
  marina: { workers: 8, wage: 27, inputs: { fish: 2, planks: 1 }, optionalInputs: { seafood: 2.5 }, revenue: 690, optionalRevenue: 560, channel: 'exports', label: 'Xuất hàng đường biển' },
  ferris_wheel: { workers: 6, wage: 24, revenue: 280, channel: 'sales', label: 'Dịch vụ vui chơi' },
  stadium: { workers: 12, wage: 30, inputs: { food: 2 }, revenue: 680, channel: 'sales', label: 'Tổ chức sự kiện' },
  airport_terminal: { workers: 16, wage: 36, revenue: 920, channel: 'exports', label: 'Thương mại liên vùng' },
}

export function createInitialEconomy(): EconomyState {
  return {
    inventory: { logs: 6, planks: 4, fish: 8, seafood: 0, food: 12, ore: 0, tools: 0 },
    capacity: 50,
    resources: { forestStock: 100, forestHealth: 100, fishStock: 100, fishHealth: 100, oreStock: 100, oreHealth: 100 },
    workforce: { available: 3, employed: 3, assignedToProduction: 3, unfilled: 15 },
    ledger: { ...EMPTY_LEDGER },
    buildingOperations: {},
    buildingSettings: {},
    trade: { reputation: 0, completed: 0, nextSequence: 3, contracts: [contractFor(0), contractFor(1), contractFor(2)] },
  }
}

export function simulateEconomy(state: GameState, elapsedHours: number): GameState {
  const elapsedDays = Math.max(0, elapsedHours) / 24
  const inventory = { ...state.economy.inventory }
  const resources = { ...state.economy.resources }
  const buildingSettings = { ...state.economy.buildingSettings }
  const profiled = state.buildings
    .map(building => ({ building, profile: ECONOMY_PROFILES[building.type] }))
    .filter((entry): entry is { building: GameState['buildings'][number]; profile: EconomyProfile } => Boolean(entry.profile))

  const capacity = 50 + profiled.reduce((sum, { building, profile }) => sum + (profile.storage ?? 0) * levelScale(building.level), 0)
  const availableWorkers = Math.max(0, Math.floor(state.stats.population * .55))
  const staffingByBuilding = allocateWorkers(profiled, buildingSettings, availableWorkers)
  const assignedWorkers = [...staffingByBuilding.values()].reduce((sum, filled) => sum + filled, 0)
  const activeWorkerDemand = profiled.reduce((sum, { building, profile }) => settingFor(buildingSettings, building.id).paused ? sum : sum + profile.workers * levelScale(building.level), 0)
  const totalJobCapacity = state.buildings.reduce((sum, building) => sum + (BUILDING_MAP[building.type]?.jobs ?? 0) * levelScale(building.level), 0)
  const profiledJobCapacity = profiled.reduce((sum, { building }) => sum + (BUILDING_MAP[building.type]?.jobs ?? 0) * levelScale(building.level), 0)
  const otherJobCapacity = Math.max(0, totalJobCapacity - profiledJobCapacity)
  const employed = Math.min(availableWorkers, Math.round(assignedWorkers + otherJobCapacity))
  const utilityEfficiency = Math.min(1, state.stats.power / Math.max(1, state.stats.powerUse), state.stats.water / Math.max(1, state.stats.waterUse))
  const disasterEfficiency = state.disaster?.phase === 'active' ? .72 : state.disaster?.phase === 'warning' ? .92 : 1
  const ledger: EconomyLedger = { ...EMPTY_LEDGER }
  const buildingOperations: Record<string, BuildingOperation> = {}

  // Producers run before processors and sellers so the same day's local supply can move through the chain.
  const sorted = [...profiled].sort((a, b) => profileOrder(a.profile) - profileOrder(b.profile))
  sorted.forEach(({ building, profile }) => {
    const scale = levelScale(building.level)
    const requiredWorkers = profile.workers * scale
    const setting = settingFor(buildingSettings, building.id)
    const filledWorkers = staffingByBuilding.get(building.id) ?? 0
    const staffing = requiredWorkers > 0 ? filledWorkers / requiredWorkers : 1
    const healthEfficiency = Math.max(0, building.health / 100)
    const naturalEfficiency = profile.naturalResource === 'forest'
      ? Math.min(1, resources.forestStock / 25) * (.55 + resources.forestHealth / 220)
      : profile.naturalResource === 'fish'
        ? Math.min(1, resources.fishStock / 25) * (.55 + resources.fishHealth / 220)
        : profile.naturalResource === 'ore'
          ? Math.min(1, resources.oreStock / 25) * (.55 + resources.oreHealth / 220)
        : 1
    let efficiency = clamp01(staffing * utilityEfficiency * healthEfficiency * disasterEfficiency * naturalEfficiency)
    let status = 'Đang vận hành ổn định'
    let statusTone: BuildingOperation['statusTone'] = efficiency >= .75 ? 'good' : 'warning'

    if (setting.paused) { status = 'Đã tạm dừng theo lệnh'; statusTone = 'warning' }
    else if (staffing <= .02) ({ status, statusTone } = blocked('Không có lao động'))
    else if (utilityEfficiency < .2) ({ status, statusTone } = blocked('Thiếu điện hoặc nước'))
    else if (healthEfficiency < .2) ({ status, statusTone } = blocked('Công trình hư hại nặng'))
    else if (naturalEfficiency < .2) ({ status, statusTone } = blocked(profile.naturalResource === 'forest' ? 'Rừng đang suy kiệt' : profile.naturalResource === 'fish' ? 'Nguồn cá đang suy kiệt' : 'Mỏ quặng đang suy kiệt'))
    else if (staffing < .75) status = `Thiếu lao động · ${Math.round(staffing * 100)}% biên chế`

    const inputLimit = flowLimit(profile.inputs, inventory, scale)
    const outputLimit = storageLimit(profile.outputs, profile.inputs, inventory, capacity, scale)
    if (!setting.paused && inputLimit < efficiency) {
      efficiency = inputLimit
      const missing = firstMissing(profile.inputs, inventory, scale)
      ;({ status, statusTone } = blocked(missing ? `Thiếu ${RESOURCE_LABELS[missing]}` : 'Thiếu nguyên liệu'))
    }
    if (!setting.paused && outputLimit < efficiency) {
      efficiency = outputLimit
      ;({ status, statusTone } = blocked('Kho đã đầy'))
    }
    if (profile.storage && efficiency > .02) {
      status = staffing < .75 ? `Kho hoạt động ${Math.round(staffing * 100)}%` : 'Kho vận hành bình thường'
      statusTone = staffing < .75 ? 'warning' : 'good'
    }

    const optionalEfficiency = setting.paused || !profile.optionalInputs ? 0 : Math.min(efficiency, flowLimit(profile.optionalInputs, inventory, scale))
    const dailyInputs = scaleFlow(profile.inputs, scale * efficiency)
    const dailyOptionalInputs = scaleFlow(profile.optionalInputs, scale * optionalEfficiency)
    const dailyOutputs = scaleFlow(profile.outputs, scale * efficiency)
    applyFlow(inventory, dailyInputs, -elapsedDays)
    applyFlow(inventory, dailyOptionalInputs, -elapsedDays)
    applyFlow(inventory, dailyOutputs, elapsedDays)
    const valueAddedRevenue = (profile.optionalRevenue ?? 0) * scale * optionalEfficiency
    const dailyRevenue = (profile.revenue ?? 0) * scale * efficiency + valueAddedRevenue
    const dailyCost = filledWorkers * profile.wage
    ledger.wages += dailyCost
    if (profile.channel === 'exports') ledger.exports += dailyRevenue
    else ledger.sales += dailyRevenue

    const produced = describeFlow(dailyOutputs, '+')
    const consumed = describeFlow(mergeFlow(dailyInputs, dailyOptionalInputs), '-')
    if (valueAddedRevenue > 0 && statusTone !== 'blocked') status = `Có hàng chế biến · tăng ${Math.round(valueAddedRevenue)} ₫/ngày`
    buildingOperations[building.id] = {
      buildingId: building.id,
      type: building.type,
      requiredWorkers: round1(requiredWorkers),
      filledWorkers: round1(filledWorkers),
      staffing: Math.round(staffing * 100),
      efficiency: Math.round(efficiency * 100),
      status,
      statusTone,
      flow: [consumed, produced].filter(Boolean).join(' · ') || profile.label,
      dailyRevenue: Math.round(dailyRevenue),
      dailyCost: Math.round(dailyCost),
      priority: setting.priority,
      paused: setting.paused,
    }

    if (profile.naturalResource === 'forest') resources.forestStock = clamp(resources.forestStock - sumFlow(dailyOutputs) * .22 * elapsedDays, 0, 100)
    if (profile.naturalResource === 'fish') resources.fishStock = clamp(resources.fishStock - sumFlow(dailyOutputs) * .25 * elapsedDays, 0, 100)
    if (profile.naturalResource === 'ore') resources.oreStock = clamp(resources.oreStock - sumFlow(dailyOutputs) * .18 * elapsedDays, 0, 100)
  })

  resources.forestStock = clamp(resources.forestStock + .9 * elapsedDays, 0, 100)
  resources.fishStock = clamp(resources.fishStock + 1.15 * elapsedDays, 0, 100)
  resources.oreStock = clamp(resources.oreStock + .3 * elapsedDays, 0, 100)
  resources.forestHealth = clamp(resources.forestHealth + (resources.forestStock > 55 ? .45 : -.5) * elapsedDays, 15, 100)
  resources.fishHealth = clamp(resources.fishHealth + (resources.fishStock > 50 ? .55 : -.6) * elapsedDays, 15, 100)
  resources.oreHealth = clamp(resources.oreHealth + (resources.oreStock > 40 ? .12 : -.35) * elapsedDays, 15, 100)

  ledger.upkeep = state.buildings.reduce((sum, building) => sum + (BUILDING_MAP[building.type]?.upkeep ?? 0) * levelScale(building.level), 0)
  ledger.policies = policyUpkeep(state)
  ledger.householdTax = employed * 8
  const operatingProfit = Math.max(0, ledger.sales + ledger.exports - ledger.wages)
  ledger.businessTax = operatingProfit * .12
  ledger.starterGrant = Math.max(0, 220 - state.stats.population * 5)
  ledger.net = ledger.sales + ledger.exports + ledger.householdTax + ledger.businessTax + ledger.starterGrant - ledger.wages - ledger.upkeep - ledger.policies - ledger.imports
  Object.keys(ledger).forEach(key => { ledger[key as keyof EconomyLedger] = Math.round(ledger[key as keyof EconomyLedger]) })

  const money = Math.round((state.stats.money + ledger.net * elapsedDays) * 100) / 100
  return {
    ...state,
    stats: {
      ...state.stats,
      money,
      income: ledger.net,
      unemployment: availableWorkers ? Math.round((1 - employed / availableWorkers) * 100) : 0,
    },
    economy: {
      inventory: normalizeInventory(inventory),
      capacity: Math.round(capacity),
      resources,
      workforce: {
        available: availableWorkers,
        employed,
        assignedToProduction: round1(Math.min(availableWorkers, assignedWorkers, activeWorkerDemand)),
        unfilled: Math.max(0, Math.round(totalJobCapacity - employed)),
      },
      ledger,
      buildingOperations,
      buildingSettings,
      trade: state.economy.trade,
    },
  }
}

export function updateBuildingWorkSetting(state: GameState, buildingId: string, update: Partial<BuildingWorkSetting>): GameState {
  const current = settingFor(state.economy.buildingSettings, buildingId)
  const next = { ...current, ...update }
  return simulateEconomy({ ...state, economy: { ...state.economy, buildingSettings: { ...state.economy.buildingSettings, [buildingId]: next } } }, 0)
}

export function canFulfillTradeContract(state: GameState, contract: TradeContract) {
  return (Object.entries(contract.requirements) as [ResourceId, number][]).every(([resource, amount]) => state.economy.inventory[resource] >= amount)
}

export function fulfillTradeContract(state: GameState, contractId: string): GameState {
  const contract = state.economy.trade.contracts.find(item => item.id === contractId)
  if (!contract || !canFulfillTradeContract(state, contract)) return state
  const inventory = { ...state.economy.inventory }
  ;(Object.entries(contract.requirements) as [ResourceId, number][]).forEach(([resource, amount]) => { inventory[resource] -= amount })
  const sequence = state.economy.trade.nextSequence
  const contracts = state.economy.trade.contracts.map(item => item.id === contractId ? contractFor(sequence) : item)
  const updated: GameState = {
    ...state,
    stats: { ...state.stats, money: state.stats.money + contract.reward },
    economy: {
      ...state.economy,
      inventory: normalizeInventory(inventory),
      trade: { reputation: state.economy.trade.reputation + contract.reputation, completed: state.economy.trade.completed + 1, nextSequence: sequence + 1, contracts },
    },
  }
  return simulateEconomy(updated, 0)
}

export function economyProfile(type: string) { return ECONOMY_PROFILES[type] }
export function inventoryTotal(inventory: Inventory) { return Object.values(inventory).reduce((sum, value) => sum + value, 0) }

function levelScale(level: number) { return 1 + (level - 1) * .45 }
function profileOrder(profile: EconomyProfile) { return profile.naturalResource || (!profile.inputs && profile.outputs) ? 0 : profile.outputs ? 1 : profile.storage ? 2 : 3 }
function flowLimit(flow: Partial<Inventory> | undefined, inventory: Inventory, scale: number) {
  if (!flow) return 1
  return Math.min(1, ...Object.entries(flow).map(([resource, amount]) => inventory[resource as ResourceId] / Math.max(.001, (amount ?? 0) * scale)))
}
function storageLimit(outputs: Partial<Inventory> | undefined, inputs: Partial<Inventory> | undefined, inventory: Inventory, capacity: number, scale: number) {
  if (!outputs) return 1
  const netOutput = Math.max(0, (sumFlow(outputs) - sumFlow(inputs ?? {})) * scale)
  return netOutput > 0 ? Math.min(1, Math.max(0, capacity - inventoryTotal(inventory)) / netOutput) : 1
}
function firstMissing(flow: Partial<Inventory> | undefined, inventory: Inventory, scale: number) {
  return (Object.entries(flow ?? {}) as [ResourceId, number][]).find(([resource, amount]) => inventory[resource] + .001 < amount * scale)?.[0]
}
function scaleFlow(flow: Partial<Inventory> | undefined, factor: number): Partial<Inventory> {
  return Object.fromEntries(Object.entries(flow ?? {}).map(([resource, amount]) => [resource, (amount ?? 0) * factor]))
}
function mergeFlow(first: Partial<Inventory>, second: Partial<Inventory>): Partial<Inventory> {
  const result = { ...first }
  ;(Object.entries(second) as [ResourceId, number][]).forEach(([resource, amount]) => { result[resource] = (result[resource] ?? 0) + amount })
  return result
}
function applyFlow(inventory: Inventory, flow: Partial<Inventory>, factor: number) {
  ;(Object.entries(flow) as [ResourceId, number][]).forEach(([resource, amount]) => { inventory[resource] = Math.max(0, inventory[resource] + amount * factor) })
}
function describeFlow(flow: Partial<Inventory>, sign: '+' | '-') {
  return (Object.entries(flow) as [ResourceId, number][]).filter(([, amount]) => amount >= .05).map(([resource, amount]) => `${sign}${round1(amount)} ${RESOURCE_LABELS[resource]}`).join(', ')
}
function sumFlow(flow: Partial<Inventory>) { return Object.values(flow).reduce((sum, value) => sum + (value ?? 0), 0) }
function normalizeInventory(inventory: Inventory): Inventory { return Object.fromEntries(Object.entries(inventory).map(([key, value]) => [key, Math.round(value * 1000) / 1000])) as unknown as Inventory }
function blocked(status: string): Pick<BuildingOperation, 'status' | 'statusTone'> { return { status, statusTone: 'blocked' } }
function settingFor(settings: Record<string, BuildingWorkSetting>, buildingId: string) { return settings[buildingId] ?? DEFAULT_SETTING }
function allocateWorkers(profiled: { building: GameState['buildings'][number]; profile: EconomyProfile }[], settings: Record<string, BuildingWorkSetting>, availableWorkers: number) {
  const staffing = new Map<string, number>()
  let remaining = availableWorkers
  ;([2, 1, 0] as WorkforcePriority[]).forEach(priority => {
    const group = profiled.filter(({ building }) => { const setting = settingFor(settings, building.id); return !setting.paused && setting.priority === priority })
    const demand = group.reduce((sum, { building, profile }) => sum + profile.workers * levelScale(building.level), 0)
    const ratio = demand > 0 ? Math.min(1, remaining / demand) : 0
    group.forEach(({ building, profile }) => staffing.set(building.id, profile.workers * levelScale(building.level) * ratio))
    remaining = Math.max(0, remaining - demand * ratio)
  })
  profiled.forEach(({ building }) => { if (!staffing.has(building.id)) staffing.set(building.id, 0) })
  return staffing
}
function contractFor(sequence: number): TradeContract {
  const template = CONTRACT_TEMPLATES[sequence % CONTRACT_TEMPLATES.length]
  const tier = Math.floor(sequence / CONTRACT_TEMPLATES.length)
  const scale = 1 + tier * .18
  return {
    ...template,
    id: `trade-${sequence}`,
    requirements: Object.fromEntries(Object.entries(template.requirements).map(([resource, amount]) => [resource, Math.max(1, Math.round((amount ?? 0) * scale))])),
    reward: Math.round(template.reward * (1 + tier * .2)),
    reputation: template.reputation + Math.floor(tier / 2),
  }
}
function round1(value: number) { return Math.round(value * 10) / 10 }
function clamp01(value: number) { return clamp(value, 0, 1) }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }
