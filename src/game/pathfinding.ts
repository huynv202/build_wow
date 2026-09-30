import type { PlacedBuilding } from '../types'

export const GRID = 16

export interface RoadNetwork {
  roads: Set<string>
  adjacency: Map<string, string[]>
}

export function buildRoadNetwork(buildings: PlacedBuilding[]): RoadNetwork {
  const roads = new Set(buildings.filter(b => b.type === 'road').map(b => `${b.x}:${b.y}`))
  const adjacency = new Map<string, string[]>()
  for (const key of roads) {
    const [x, y] = key.split(':').map(Number)
    const neighbors: string[] = []
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nk = `${x + dx}:${y + dy}`
      if (roads.has(nk)) neighbors.push(nk)
    }
    adjacency.set(key, neighbors)
  }
  return { roads, adjacency }
}

/** BFS shortest path over the road graph. Returns tile keys ('x:y') including start and goal, or null. */
export function findPath(network: RoadNetwork, startKey: string, goalKey: string): string[] | null {
  if (startKey === goalKey) return [startKey]
  if (!network.roads.has(startKey) || !network.roads.has(goalKey)) return null
  const previous = new Map<string, string>([[startKey, startKey]])
  let frontier = [startKey]
  while (frontier.length) {
    const next: string[] = []
    for (const key of frontier) {
      for (const neighbor of network.adjacency.get(key) ?? []) {
        if (previous.has(neighbor)) continue
        previous.set(neighbor, key)
        if (neighbor === goalKey) {
          const path = [goalKey]
          let cursor = goalKey
          while (cursor !== startKey) { cursor = previous.get(cursor)!; path.push(cursor) }
          return path.reverse()
        }
        next.push(neighbor)
      }
    }
    frontier = next
  }
  return null
}

export interface Trip { from: string; to: string; path: string[]; progress: number; speed: number; offset: number }

export function randomTrip(network: RoadNetwork, rng: () => number): Trip | null {
  const keys = [...network.roads]
  if (keys.length < 4) return null
  const from = keys[Math.floor(rng() * keys.length)]
  const to = keys[Math.floor(rng() * keys.length)]
  if (from === to) return null
  const path = findPath(network, from, to)
  if (!path || path.length < 3) return null
  return { from, to, path, progress: rng(), speed: .05 + rng() * .05, offset: rng() * .2 }
}

export function pointAlongTrip(trip: Trip, t: number): { x: number; z: number; angle: number } | null {
  const count = trip.path.length
  if (count < 2) return null
  const scaled = Math.min(.9999, Math.max(0, t)) * (count - 1)
  const index = Math.floor(scaled)
  const frac = scaled - index
  const [ax, ay] = trip.path[index].split(':').map(Number)
  const [bx, by] = trip.path[Math.min(count - 1, index + 1)].split(':').map(Number)
  return { x: ax + (bx - ax) * frac, z: ay + (by - ay) * frac, angle: Math.atan2(bx - ax, by - ay) }
}

/** Commute route: from the road nearest a home to the road nearest a workplace. */
export function commuteTrip(network: RoadNetwork, homeKey: string, workKey: string): Trip | null {
  const start = nearestRoadKey(network, homeKey), goal = nearestRoadKey(network, workKey)
  if (!start || !goal || start === goal) return null
  const path = findPath(network, start, goal)
  if (!path || path.length < 2) return null
  return { from: start, to: goal, path, progress: 0, speed: .04 + Math.random() * .03, offset: Math.random() * .2 }
}

export function nearestRoadKey(network: RoadNetwork, key: string): string | null {
  if (network.roads.has(key)) return key
  const [x, y] = key.split(':').map(Number)
  let best: string | null = null, bestDistance = Infinity
  for (const road of network.roads) {
    const [rx, ry] = road.split(':').map(Number)
    const distance = Math.abs(rx - x) + Math.abs(ry - y)
    if (distance < bestDistance) { bestDistance = distance; best = road }
  }
  return best
}
