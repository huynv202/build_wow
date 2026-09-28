import type { GameState } from '../types'

const KEY = 'haven-city-save-v1'
export function saveGame(state: GameState) { localStorage.setItem(KEY, JSON.stringify({ ...state, savedAt: Date.now() })) }
export function loadGame(): GameState | null {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) as GameState : null } catch { return null }
}
export function hasSave() { return Boolean(localStorage.getItem(KEY)) }
