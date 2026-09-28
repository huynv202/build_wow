export type Category = 'roads' | 'homes' | 'commerce' | 'services' | 'utilities' | 'nature'
export type Tool = 'inspect' | 'bulldoze' | string
export type Overlay = 'none' | 'power' | 'water' | 'happiness' | 'flood'
export type Weather = 'Nắng đẹp' | 'Có mây' | 'Mưa' | 'Mưa lớn'

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
  protection?: 'uv' | 'storm' | 'wave' | 'flood'
  protectionRadius?: number
  description: string
}

export interface PlacedBuilding { id: string; type: string; x: number; y: number; level: number; health: number }
export interface CityStats { money: number; population: number; happiness: number; power: number; powerUse: number; water: number; waterUse: number; level: number; xp: number; income: number }
export interface Notification { id: number; title: string; body: string; priority: 'low' | 'high' | 'critical' }
export type DisasterKind = 'flood' | 'uv' | 'storm' | 'wave'
export interface Disaster { kind: DisasterKind; phase: 'warning' | 'active' | 'recovery'; progress: number; severity: number }
export interface GameState {
  buildings: PlacedBuilding[]
  stats: CityStats
  weather: Weather
  hour: number
  day: number
  disaster: Disaster | null
}
