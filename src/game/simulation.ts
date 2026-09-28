import { BUILDING_MAP } from '../data/buildings'
import type { GameState, PlacedBuilding } from '../types'

export const INITIAL_BUILDINGS: PlacedBuilding[] = [
  { id: 'seed-1', type: 'road', x: 7, y: 7, level: 1, health: 100 }, { id: 'seed-2', type: 'road', x: 8, y: 7, level: 1, health: 100 },
  { id: 'seed-3', type: 'road', x: 9, y: 7, level: 1, health: 100 }, { id: 'seed-4', type: 'road', x: 10, y: 7, level: 1, health: 100 },
  { id: 'seed-5', type: 'road', x: 8, y: 8, level: 1, health: 100 }, { id: 'seed-6', type: 'road', x: 8, y: 9, level: 1, health: 100 },
  { id: 'seed-7', type: 'house', x: 7, y: 8, level: 1, health: 100 }, { id: 'seed-8', type: 'house', x: 9, y: 8, level: 1, health: 100 },
  { id: 'seed-9', type: 'market', x: 9, y: 6, level: 1, health: 100 }, { id: 'seed-10', type: 'solar', x: 11, y: 7, level: 1, health: 100 },
  { id: 'seed-11', type: 'water', x: 8, y: 10, level: 1, health: 100 }, { id: 'seed-12', type: 'park', x: 7, y: 6, level: 1, health: 100 },
]

export const initialState = (): GameState => ({
  buildings: INITIAL_BUILDINGS,
  stats: { money: 12500, population: 36, happiness: 72, power: 55, powerUse: 11, water: 65, waterUse: 6, level: 1, xp: 35, income: 0 },
  weather: 'Nắng đẹp', hour: 7.5, day: 1, disaster: null,
})

export function calculateStats(state: GameState): GameState['stats'] {
  let population = 0, jobs = 0, power = 0, powerUse = 0, water = 0, waterUse = 0, happinessImpact = 0, upkeep = 0
  state.buildings.forEach((placed) => {
    const item = BUILDING_MAP[placed.type]
    const scale = 1 + (placed.level - 1) * .45
    population += (item.population ?? 0) * scale
    jobs += (item.jobs ?? 0) * scale
    const energy = (item.power ?? 0) * scale
    const hydration = (item.water ?? 0) * scale
    if (energy >= 0) power += energy; else powerUse -= energy
    if (hydration >= 0) water += hydration; else waterUse -= hydration
    happinessImpact += (item.happiness ?? 0) * scale
    upkeep += item.upkeep * scale
  })
  const powered = powerUse <= power, watered = waterUse <= water
  const employment = population ? Math.min(1, jobs / (population * .55)) : 1
  const happiness = Math.round(Math.max(20, Math.min(98, 58 + happinessImpact * .45 + employment * 12 - (!powered ? 18 : 0) - (!watered ? 22 : 0))))
  const revenue = population * 4.2 + jobs * 2.8
  return { ...state.stats, population: Math.round(population), happiness, power: Math.round(power), powerUse: Math.round(powerUse), water: Math.round(water), waterUse: Math.round(waterUse), income: Math.round(revenue - upkeep), level: Math.max(1, Math.floor(population / 250) + 1), xp: population % 250 }
}
