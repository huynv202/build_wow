export type Category = 'roads' | 'transport' | 'homes' | 'commerce' | 'services' | 'utilities' | 'nature' | 'landmarks'
export type Tool = 'inspect' | 'bulldoze' | string
export type Overlay = 'none' | 'power' | 'water' | 'happiness' | 'flood' | 'population' | 'medical' | 'safety' | 'protection' | 'traffic'
export type Weather = 'Nắng đẹp' | 'Có mây' | 'Mưa' | 'Mưa lớn'
export type PolicyId = 'housing_support' | 'green_priority' | 'transit_priority'

export interface BuildingDefinition {
  id: string
  name: string
  category: Category
  icon: string
  cost: number
  upkeep: number
  color: string
  height: number
  population?: number
  jobs?: number
  power?: number
  water?: number
  happiness?: number
  resilience?: number
  maxLevel?: number
  levelNames?: string[]
  protection?: 'uv' | 'storm' | 'wave' | 'flood' | 'zombie' | 'monster' | 'epidemic' | 'blackout'
  protectionRadius?: number
  gridStability?: number
  mobility?: number
  assetPath?: string
  description: string
}

export type RotationStep = 0 | 1 | 2 | 3
export interface PlacedBuilding { id: string; type: string; x: number; y: number; level: number; health: number; rotation?: RotationStep }
export interface CityStats { money: number; population: number; housingCapacity: number; jobs: number; unemployment: number; happiness: number; power: number; powerUse: number; water: number; waterUse: number; level: number; xp: number; income: number }
export type ResourceId = 'logs' | 'planks' | 'fish' | 'seafood' | 'food' | 'ore' | 'tools'
export type Inventory = Record<ResourceId, number>
export type WorkforcePriority = 0 | 1 | 2
export interface BuildingWorkSetting { priority: WorkforcePriority; paused: boolean }
export interface BuildingOperation {
  buildingId: string
  type: string
  requiredWorkers: number
  filledWorkers: number
  staffing: number
  efficiency: number
  status: string
  statusTone: 'good' | 'warning' | 'blocked'
  flow: string
  dailyRevenue: number
  dailyCost: number
  priority: WorkforcePriority
  paused: boolean
}
export interface EconomyLedger {
  sales: number
  exports: number
  householdTax: number
  businessTax: number
  starterGrant: number
  wages: number
  upkeep: number
  policies: number
  imports: number
  net: number
}
export interface EconomyState {
  inventory: Inventory
  capacity: number
  resources: { forestStock: number; forestHealth: number; fishStock: number; fishHealth: number; oreStock: number; oreHealth: number }
  workforce: { available: number; employed: number; assignedToProduction: number; unfilled: number }
  ledger: EconomyLedger
  buildingOperations: Record<string, BuildingOperation>
  buildingSettings: Record<string, BuildingWorkSetting>
  trade: { reputation: number; completed: number; nextSequence: number; contracts: TradeContract[] }
}
export interface TradeContract { id: string; title: string; description: string; requirements: Partial<Inventory>; reward: number; reputation: number }
export interface CityDynamics {
  groups: { families: number; workers: number; students: number; elderly: number; tourists: number }
  services: { health: number; education: number; safety: number; mobility: number; resilience: number; defense: number }
  pressures: { housing: number; jobs: number; affordability: number; environment: number }
  momentum: number
}
export interface Notification { id: number; title: string; body: string; priority: 'low' | 'high' | 'critical' }
export interface GameProgress { claimedMissions: string[]; activePolicies: PolicyId[]; threatsSurvived: number; nextThreatDay: number }
export interface GridPoint { x: number; y: number }
export interface PlacementPlan {
  valid: GridPoint[]
  invalid: GridPoint[]
  cost: number
  refund: number
  affordable: boolean
  message: string
}
export type DisasterKind = 'flood' | 'uv' | 'storm' | 'wave' | 'zombie' | 'monster' | 'epidemic' | 'blackout'
export interface Disaster { kind: DisasterKind; phase: 'warning' | 'active' | 'recovery'; progress: number; severity: number; response?: number }
export interface GameState {
  buildings: PlacedBuilding[]
  stats: CityStats
  weather: Weather
  hour: number
  day: number
  disaster: Disaster | null
  dynamics: CityDynamics
  progress: GameProgress
  economy: EconomyState
}
