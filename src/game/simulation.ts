import { BUILDING_MAP } from '../data/buildings'
import { createInitialEconomy, simulateEconomy } from './economy'
import { cityLevel } from './progression'
import type { GameState, PlacedBuilding } from '../types'

export const INITIAL_BUILDINGS: PlacedBuilding[] = [
  ...Array.from({ length: 5 }, (_, i) => ({ id: `starter-road-h-${i}`, type: 'road', x: 6 + i, y: 8, level: 1, health: 100 })),
  ...Array.from({ length: 5 }, (_, i) => ({ id: `starter-road-v-${i}`, type: 'road', x: 8, y: 6 + i, level: 1, health: 100 })).filter(road => road.y !== 8),
  { id: 'starter-house', type: 'house', x: 7, y: 7, level: 1, health: 100 },
  { id: 'starter-market', type: 'market', x: 9, y: 7, level: 1, health: 100 },
  { id: 'starter-park', type: 'park', x: 7, y: 9, level: 1, health: 100 },
  { id: 'starter-solar', type: 'solar', x: 9, y: 9, level: 1, health: 100 },
  { id: 'starter-water', type: 'water', x: 8, y: 10, level: 1, health: 100 },
]

export const initialState = (): GameState => {
  const state: GameState = {
    buildings: INITIAL_BUILDINGS,
    stats: { money: 35000, population: 6, housingCapacity: 0, jobs: 0, unemployment: 0, happiness: 68, power: 0, powerUse: 0, water: 0, waterUse: 0, level: 1, xp: 6, income: 0 },
    weather: 'Nắng đẹp', hour: 7.5, day: 1, disaster: null,
    dynamics: { groups: { families: 2, workers: 3, students: 1, elderly: 0, tourists: 0 }, services: { health: 36, education: 34, safety: 38, mobility: 58, resilience: 24, defense: 8 }, pressures: { housing: 45, jobs: 35, affordability: 78, environment: 74 }, momentum: 0 },
    progress: { claimedMissions: [], activePolicies: [], threatsSurvived: 0, nextThreatDay: 4 },
    economy: createInitialEconomy(),
  }
  return recalculateState(state)
}

export function recalculateState(state: GameState) { return simulateEconomy({ ...state, stats: calculateStats(state) }, 0) }

export function calculateStats(state: GameState): GameState['stats'] {
  let population = 0, jobs = 0, power = 0, powerUse = 0, water = 0, waterUse = 0, happinessImpact = 0
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
  })
  const powered = powerUse <= power, watered = waterUse <= water
  const housingCapacity = Math.round(population)
  const actualPopulation = Math.min(state.stats.population, housingCapacity)
  const employment = actualPopulation ? Math.min(1, jobs / (actualPopulation * .55)) : 1
  const happiness = Math.round(Math.max(20, Math.min(98, 58 + happinessImpact * .45 + employment * 12 - (!powered ? 18 : 0) - (!watered ? 22 : 0))))
  const level = cityLevel(actualPopulation)
  return { ...state.stats, population: actualPopulation, housingCapacity, jobs: Math.round(jobs), unemployment: Math.round((1-employment)*100), happiness, power: Math.round(power), powerUse: Math.round(powerUse), water: Math.round(water), waterUse: Math.round(waterUse), income: state.economy?.ledger.net ?? 0, level, xp: actualPopulation }
}

export function budgetBreakdown(state: GameState) {
  return state.economy.ledger
}
