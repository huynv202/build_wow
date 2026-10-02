import { initialState } from './simulation'
import { simulateEconomy } from './economy'
import { BUILDING_MAP } from '../data/buildings'
import type { BuildingWorkSetting, GameState, Inventory, PlacedBuilding, ResourceId, RotationStep, TradeContract } from '../types'

const KEY = 'haven-city-save-v1'
export function saveGame(state: GameState) { localStorage.setItem(KEY, JSON.stringify({ ...state, savedAt: Date.now() })) }
export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Partial<GameState>
    const fallback = initialState()
    const merged: GameState = {
      ...fallback,
      ...saved,
      buildings: sanitizeBuildings(saved.buildings, fallback.buildings),
      stats: { ...fallback.stats, ...saved.stats },
      dynamics: {
        ...fallback.dynamics,
        ...saved.dynamics,
        groups: { ...fallback.dynamics.groups, ...saved.dynamics?.groups },
        services: { ...fallback.dynamics.services, ...saved.dynamics?.services },
        pressures: { ...fallback.dynamics.pressures, ...saved.dynamics?.pressures },
      },
      progress: {
        ...fallback.progress,
        ...saved.progress,
        claimedMissions: saved.progress?.claimedMissions ?? [],
        activePolicies: saved.progress?.activePolicies ?? [],
      },
      economy: {
        ...fallback.economy,
        ...saved.economy,
        inventory: sanitizeInventory(saved.economy?.inventory, fallback.economy.inventory),
        resources: { ...fallback.economy.resources, ...saved.economy?.resources },
        workforce: { ...fallback.economy.workforce, ...saved.economy?.workforce },
        ledger: { ...fallback.economy.ledger, ...saved.economy?.ledger },
        buildingOperations: saved.economy?.buildingOperations ?? {},
        buildingSettings: sanitizeBuildingSettings(saved.economy?.buildingSettings),
        trade: {
          ...fallback.economy.trade,
          ...saved.economy?.trade,
          reputation: nonNegative(saved.economy?.trade?.reputation, fallback.economy.trade.reputation),
          completed: nonNegative(saved.economy?.trade?.completed, fallback.economy.trade.completed),
          nextSequence: nonNegative(saved.economy?.trade?.nextSequence, fallback.economy.trade.nextSequence),
          contracts: sanitizeContracts(saved.economy?.trade?.contracts, fallback.economy.trade.contracts),
        },
      },
    }
    return simulateEconomy(merged, 0)
  } catch { return null }
}
export function hasSave() { return Boolean(localStorage.getItem(KEY)) }

function sanitizeBuildings(value: GameState['buildings'] | undefined, fallback: GameState['buildings']) {
  if (!Array.isArray(value)) return fallback
  return value.flatMap((building): PlacedBuilding[] => {
    const definition = building && BUILDING_MAP[building.type]
    if (!definition || typeof building.id !== 'string' || !Number.isFinite(building.x) || !Number.isFinite(building.y)) return []
    const maxLevel = definition.maxLevel ?? 4
    return [{
      id: building.id,
      type: building.type,
      x: Math.round(building.x),
      y: Math.round(building.y),
      level: clamp(Math.round(Number(building.level) || 1), 1, maxLevel),
      health: clamp(Math.round(Number.isFinite(building.health) ? building.health : 100), 0, 100),
      rotation: clamp(Math.round(Number(building.rotation) || 0), 0, 3) as RotationStep,
    }]
  })
}

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }

const RESOURCE_IDS: ResourceId[] = ['logs', 'planks', 'fish', 'seafood', 'food', 'ore', 'tools']
function sanitizeInventory(value: Partial<Inventory> | undefined, fallback: Inventory): Inventory {
  return Object.fromEntries(RESOURCE_IDS.map(resource => [resource, nonNegative(value?.[resource], fallback[resource])])) as Inventory
}

function sanitizeBuildingSettings(value: Record<string, BuildingWorkSetting> | undefined) {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(Object.entries(value).flatMap(([id, setting]) => {
    if (!setting || ![0, 1, 2].includes(setting.priority)) return []
    return [[id, { priority: setting.priority, paused: Boolean(setting.paused) }]]
  }))
}

function sanitizeContracts(value: TradeContract[] | undefined, fallback: TradeContract[]) {
  if (!Array.isArray(value) || value.length !== 3) return fallback
  const valid = value.every(contract => contract && typeof contract.id === 'string' && typeof contract.title === 'string' && typeof contract.description === 'string' && nonNegative(contract.reward, -1) >= 0 && nonNegative(contract.reputation, -1) >= 0 && Object.entries(contract.requirements ?? {}).every(([resource, amount]) => RESOURCE_IDS.includes(resource as ResourceId) && Number.isFinite(amount) && amount > 0))
  return valid ? value : fallback
}

function nonNegative(value: number | undefined, fallback: number) { return Number.isFinite(value) && Number(value) >= 0 ? Number(value) : fallback }
