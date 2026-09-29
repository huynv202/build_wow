import { initialState } from './simulation'
import type { GameState } from '../types'

const KEY = 'haven-city-save-v1'
export function saveGame(state: GameState) { localStorage.setItem(KEY, JSON.stringify({ ...state, savedAt: Date.now() })) }
export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Partial<GameState>
    const fallback = initialState()
    return {
      ...fallback,
      ...saved,
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
    }
  } catch { return null }
}
export function hasSave() { return Boolean(localStorage.getItem(KEY)) }
