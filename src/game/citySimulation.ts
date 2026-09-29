import { BUILDING_MAP } from '../data/buildings'
import { threatPopulationPenalty } from './disasters'
import { cityLevel } from './progression'
import type { CityDynamics, GameState } from '../types'

export function simulateCity(state: GameState): GameState {
  const hasPolicy = (id: GameState['progress']['activePolicies'][number]) => state.progress.activePolicies.includes(id)
  const counts = (type: string) => state.buildings.filter(building => building.type === type).reduce((sum, building) => sum + building.level, 0)
  const blackoutFactor = state.disaster?.kind === 'blackout' && state.disaster.phase === 'active' ? .42 : 1
  const rawUtilitySupply = Math.min(1, state.stats.power / Math.max(1, state.stats.powerUse), state.stats.water / Math.max(1, state.stats.waterUse)) * blackoutFactor
  const gridStability = state.buildings.reduce((sum, building) => sum + (BUILDING_MAP[building.type].gridStability ?? 0) * building.level, 0)
  const utilityReliability = rawUtilitySupply * Math.min(1, .88 + Math.sqrt(gridStability) * .025)
  const health = score(36 + counts('clinic') * 9 + counts('hospital') * 14, utilityReliability)
  const education = score(34 + counts('school') * 9 + counts('university') * 15, utilityReliability)
  const safety = score(38 + counts('fire') * 8 + counts('police') * 9, utilityReliability)
  const roadTiles = counts('road')
  const transitCapacity = state.buildings.reduce((sum, building) => sum + (BUILDING_MAP[building.type].mobility ?? 0) * building.level, 0)
  const mobility = clamp(35 + Math.sqrt(roadTiles) * 8 + Math.sqrt(transitCapacity) * 4.5 + (hasPolicy('transit_priority') ? 10 : 0) - Math.max(0, state.stats.population - roadTiles * 18 - transitCapacity * 3) * .04)
  const defenses = state.buildings.reduce((sum, building) => sum + (BUILDING_MAP[building.type].resilience ?? 0) * building.level, 0)
  const defense = clamp(8 + counts('police') * 8 + counts('security_hub') * 14 + counts('defense_tower') * 18 + counts('research_lab') * 6)
  const resilience = clamp(18 + Math.sqrt(defenses) * 6 + safety * .18 + defense * .08)
  const jobRatio = state.stats.jobs / Math.max(1, state.stats.population * .55)
  const housingPressure = clamp(100 - (state.stats.housingCapacity - state.stats.population) / Math.max(1, state.stats.housingCapacity) * 180)
  const jobPressure = clamp(100 - jobRatio * 82)
  const affordability = clamp(82 - state.stats.level * 3 - housingPressure * .22 + counts('market') * 2)
  const environment = clamp(68 + counts('park') * 5 + counts('solar') * 2 + (hasPolicy('green_priority') ? 10 : 0) - counts('office') - counts('mixed_use') * .5)
  const serviceAverage = (health + education + safety + mobility) / 4
  const attractiveness = serviceAverage * .34 + affordability * .2 + environment * .17 + state.stats.happiness * .2 + utilityReliability * 9
  const hasRoom = state.stats.population < state.stats.housingCapacity
  const housingSupport = hasPolicy('housing_support') && attractiveness >= 45 ? 1 : 0
  const growth = hasRoom ? Math.round(clamp((attractiveness - 48) / 18 - Math.max(0, jobPressure - 58) / 30 + housingSupport, -3, 5)) : -Math.ceil((state.stats.population - state.stats.housingCapacity) / 10)
  const disasterPenalty = threatPopulationPenalty(state)
  const nextPopulation = clamp(state.stats.population + growth - disasterPenalty, 0, state.stats.housingCapacity)
  const crisisStress = state.disaster ? state.disaster.phase === 'active' ? 12 : 6 : 0
  const happiness = Math.round(clamp(35 + serviceAverage * .28 + affordability * .12 + environment * .12 + utilityReliability * 13 - jobPressure * .12 - crisisStress))
  const groups = distributePopulation(nextPopulation, education, health)
  const dynamics: CityDynamics = {
    groups,
    services: { health, education, safety, mobility, resilience, defense },
    pressures: { housing: housingPressure, jobs: jobPressure, affordability, environment },
    momentum: clamp((state.dynamics?.momentum ?? 0) * .7 + growth * 6, -100, 100),
  }
  return { ...state, stats: { ...state.stats, population: nextPopulation, happiness, unemployment: Math.round(clamp((1-jobRatio)*100)), level: cityLevel(nextPopulation), xp: nextPopulation }, dynamics }
}

function distributePopulation(total: number, education: number, health: number) {
  const studentsShare = .1 + education / 1000
  const elderlyShare = .08 + health / 1500
  const workersShare = .44
  const students = Math.round(total * studentsShare), elderly = Math.round(total * elderlyShare), workers = Math.round(total * workersShare)
  return { families: Math.max(0, total - students - elderly - workers), workers, students, elderly, tourists: 0 }
}
function score(base: number, reliability: number) { return Math.round(clamp(base * (.55 + reliability * .45))) }
function clamp(value: number, min = 0, max = 100) { return Math.max(min, Math.min(max, value)) }
