import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { BUILDINGS, BUILDING_MAP } from './data/buildings'
import { budgetBreakdown, calculateStats, initialState, recalculateState } from './game/simulation'
import { simulateCity } from './game/citySimulation'
import { canFulfillTradeContract, fulfillTradeContract, inventoryTotal, simulateEconomy, updateBuildingWorkSetting } from './game/economy'
import { buildingEffectBadges } from './game/buildingEffects'
import { serviceLabel, serviceReach } from './game/services'
import { applyDisasterDamage, availableThreats, DISASTERS, threatReadiness } from './game/disasters'
import { activeMission, isUnlocked, levelProgress, missionComplete, missionStepValue, missionValue, MISSIONS, POLICIES, unlockLevel } from './game/progression'
import { hasSave, loadGame, saveGame } from './game/storage'
import type { Category, DisasterKind, GameState, GridPoint, Notification, Overlay, PlacementPlan, PolicyId, ResourceId, RotationStep, Tool, TradeContract, WorkforcePriority } from './types'
import './styles.css'

const CityCanvas = lazy(() => import('./components/CityCanvas').then(module => ({ default: module.CityCanvas })))

const categories: { id: Category; label: string; icon: string }[] = [
  { id: 'roads', label: 'Đường', icon: '⌁' }, { id: 'transport', label: 'Giao thông', icon: '▰' }, { id: 'homes', label: 'Nhà ở', icon: '⌂' }, { id: 'commerce', label: 'Kinh tế', icon: '◇' },
  { id: 'services', label: 'Dịch vụ', icon: '✚' }, { id: 'utilities', label: 'Hạ tầng', icon: '◫' }, { id: 'nature', label: 'Cảnh quan', icon: '♣' }, { id: 'landmarks', label: 'Điểm nhấn', icon: '◈' },
]
const weatherCycle: GameState['weather'][] = ['Nắng đẹp', 'Có mây', 'Mưa', 'Mưa lớn', 'Có mây']
const cityTitles = ['Khu định cư mới', 'Thị trấn xanh', 'Đô thị năng động', 'Thành phố đáng sống', 'Trung tâm vùng', 'Siêu đô thị chống chịu']
const OVERLAY_OPTIONS: Overlay[] = ['none', 'power', 'water', 'happiness', 'flood', 'population', 'medical', 'safety', 'protection', 'traffic']
const OVERLAY_HINTS: Record<Overlay, string> = {
  none: 'Chế độ hiển thị tiêu chuẩn', power: 'Nguồn và lưới điện', water: 'Nguồn và lưới nước', happiness: 'Mức độ hài lòng theo khu', flood: 'Ngập lụt, kè biển và thoát nước',
  population: 'Heatmap mật độ dân số', medical: 'Vùng phủ bệnh viện · phòng khám', safety: 'Vùng phủ cảnh sát · cứu hỏa', protection: 'Vùng bảo vệ UV, an ninh và phòng thủ', traffic: 'Ùn tắc giao thông theo màu',
}
const SERVICE_TYPES = new Set(['clinic', 'hospital', 'police', 'fire', 'school', 'university', 'uv_station', 'drain', 'seawall', 'shelter', 'security_hub', 'research_lab', 'defense_tower'])
const RESOURCE_META = {
  logs: { icon: '♠', label: 'Gỗ tròn' }, planks: { icon: '▧', label: 'Ván gỗ' }, fish: { icon: '≋', label: 'Cá tươi' }, seafood: { icon: '◈', label: 'Hải sản chế biến' }, food: { icon: '◒', label: 'Lương thực' }, ore: { icon: '◆', label: 'Quặng' }, tools: { icon: '⚙', label: 'Công cụ' },
} as const
const TOP_RESOURCE_IDS: ResourceId[] = ['food', 'fish', 'seafood', 'tools']
const SUPPLY_CHAINS = [
  { id: 'seafood', icon: '≋', title: 'Kinh tế biển', description: 'Cá tươi được chế biến lạnh rồi bán nội địa hoặc xuất khẩu. Hàng chế biến tạo thêm tới 560 ₫/ngày tại mỗi đầu ra.', stages: [
    { label: 'Đánh bắt', types: ['fishing_dock'], buildType: 'fishing_dock' }, { label: 'Chế biến', types: ['seafood_factory'], buildType: 'seafood_factory' }, { label: 'Tiêu thụ', types: ['market', 'supermarket', 'marina'], buildType: 'market' },
  ] },
  { id: 'timber', icon: '♠', title: 'Gỗ và chế tạo', description: 'Gỗ tròn qua xưởng cưa thành ván; ván kết hợp quặng để tạo công cụ giá trị cao.', stages: [
    { label: 'Lâm nghiệp', types: ['logging_camp'], buildType: 'logging_camp' }, { label: 'Xưởng cưa', types: ['sawmill'], buildType: 'sawmill' }, { label: 'Chế tạo', types: ['workshop'], buildType: 'workshop' },
  ] },
  { id: 'food', icon: '◒', title: 'Lương thực đô thị', description: 'Nông trại cấp hàng cho chợ, siêu thị, khách sạn và sự kiện; thiếu lương thực sẽ làm nhiều dịch vụ dừng.', stages: [
    { label: 'Sản xuất', types: ['farm'], buildType: 'farm' }, { label: 'Phân phối', types: ['market', 'supermarket'], buildType: 'market' }, { label: 'Dịch vụ', types: ['hotel', 'stadium'], buildType: 'hotel' },
  ] },
  { id: 'logistics', icon: '▤', title: 'Kho vận và giao thương', description: 'Kho giữ chuỗi không bị nghẽn; cảng và sân bay biến hàng tồn thành thu nhập liên vùng.', stages: [
    { label: 'Kho hàng', types: ['warehouse'], buildType: 'warehouse' }, { label: 'Cảng biển', types: ['marina'], buildType: 'marina' }, { label: 'Liên vùng', types: ['airport_terminal'], buildType: 'airport_terminal' },
  ] },
] as const

export default function App() {
  const [started, setStarted] = useState(false)
  const [game, setGame] = useState<GameState>(initialState)
  const [tool, setTool] = useState<Tool>('inspect')
  const [category, setCategory] = useState<Category>('homes')
  const [selected, setSelected] = useState<string | null>(null)
  const [overlay, setOverlay] = useState<Overlay>('none')
  const [speed, setSpeed] = useState(1)
  const [toast, setToast] = useState<Notification | null>({ id: 1, title: 'Chào mừng, Thị trưởng', body: 'Hãy biến Haven thành một thành phố đáng sống.', priority: 'low' })
  const [buildOpen, setBuildOpen] = useState(true)
  const [scenario, setScenario] = useState<DisasterKind>('flood')
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [missionsOpen, setMissionsOpen] = useState(false)
  const [placementPreview, setPlacementPreview] = useState<PlacementPlan | null>(null)
  const [rotation, setRotation] = useState<RotationStep>(0)
  const [moveRequest, setMoveRequest] = useState<{ id: string; nonce: number } | null>(null)
  const history = useRef<{ past: GameState[]; future: GameState[] }>({ past: [], future: [] })
  const simulationHours = useRef(0)
  const autosaveTicks = useRef(0)
  const lastDay = useRef<number | null>(null)
  const lastLevel = useRef<number | null>(null)

  useEffect(() => {
    if (!started || speed === 0) return
    const id = window.setInterval(() => setGame(previous => {
      const deltaHours = .12 * speed
      let next: GameState = {
        ...previous,
        hour: previous.hour + deltaHours,
      }
      while (next.hour >= 24) {
        next = { ...next, hour: next.hour - 24, day: next.day + 1, weather: weatherCycle[(next.day + 1) % weatherCycle.length] }
      }

      simulationHours.current += deltaHours
      while (simulationHours.current >= 1.2) {
        simulationHours.current -= 1.2
        next = simulateCity({ ...next, stats: calculateStats(next) })
      }

      if (next.disaster) {
        const disaster = { ...next.disaster, progress: next.disaster.progress + speed }
        if (disaster.phase === 'warning' && disaster.progress >= 30) {
          disaster.phase = 'active'; disaster.progress = 0
          next = { ...next, weather: disaster.kind === 'uv' ? 'Nắng đẹp' : 'Mưa lớn', disaster }
        } else if (disaster.phase === 'active' && disaster.progress >= 45) {
          disaster.phase = 'recovery'; disaster.progress = 0
          next = { ...next, disaster, buildings: applyDisasterDamage({ ...next, disaster }) }
          window.setTimeout(() => setToast({ id: Date.now(), title: 'Nguy hiểm đã qua', body: 'Kiểm tra tình trạng công trình và sửa chữa các khu vực bị hư hại.', priority: 'high' }), 0)
        } else if (disaster.phase === 'recovery' && disaster.progress >= 25) {
          const readiness = threatReadiness(next, disaster.kind).score + (disaster.response ?? 0)
          const relief = Math.round(disaster.severity * 120 + readiness * 8)
          next = { ...next, disaster: null, weather: 'Có mây', stats: { ...next.stats, money: next.stats.money + relief }, progress: { ...next.progress, threatsSurvived: next.progress.threatsSurvived + 1 } }
          window.setTimeout(() => setToast({ id: Date.now(), title: 'Thành phố đã vượt qua khủng hoảng', body: `Năng lực ứng phó được ghi nhận · nhận ${money(relief)} hỗ trợ phục hồi.`, priority: 'low' }), 0)
        } else next = { ...next, disaster }
      }

      next = { ...next, stats: calculateStats(next) }
      next = simulateEconomy(next, deltaHours)
      autosaveTicks.current += 1
      if (autosaveTicks.current >= 50) { autosaveTicks.current = 0; saveGame(next) }
      return next
    }), 500)
    return () => window.clearInterval(id)
  }, [started, speed])

  useEffect(() => {
    if (!started) return
    if (lastDay.current === null) { lastDay.current = game.day; return }
    if (game.day > lastDay.current) {
      lastDay.current = game.day
      setToast({ id: Date.now(), title: `Báo cáo ngày ${game.day}`, body: `${game.stats.income >= 0 ? 'Lãi' : 'Lỗ'} ${money(Math.abs(game.stats.income))}/ngày · bán hàng ${money(game.economy.ledger.sales + game.economy.ledger.exports)} · ${populationPulse(game)}.`, priority: game.stats.income >= 0 ? 'low' : 'high' })
    }
  }, [game.day, game.stats.income, started])

  useEffect(() => {
    if (!started || game.disaster || game.day < game.progress.nextThreatDay) return
    const pool = availableThreats(game.stats.level)
    const kind = pool[(game.day + game.buildings.length + game.progress.threatsSurvived) % pool.length]
    const info = DISASTERS[kind]
    setGame(previous => ({ ...previous, disaster: { kind, phase: 'warning', progress: 0, severity: info.severity, response: 0 }, progress: { ...previous.progress, nextThreatDay: previous.day + 3 + (previous.progress.threatsSurvived % 3) } }))
    setToast({ id: Date.now(), title: `CẢNH BÁO TỰ ĐỘNG: ${info.name.toUpperCase()}`, body: `${info.warning}. Cần chuẩn bị: ${info.preparation}.`, priority: 'critical' })
  }, [game.buildings.length, game.day, game.disaster, game.progress.nextThreatDay, game.progress.threatsSurvived, game.stats.level, started])

  useEffect(() => {
    if (!started) return
    if (lastLevel.current === null) { lastLevel.current = game.stats.level; return }
    if (game.stats.level > lastLevel.current) {
      lastLevel.current = game.stats.level
      setToast({ id: Date.now(), title: `Thành phố đạt cấp ${game.stats.level}`, body: 'Công trình và chính sách mới đã được mở khóa.', priority: 'low' })
    }
  }, [game.stats.level, started])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 5000)
    return () => window.clearTimeout(id)
  }, [toast])

  const selectedBuilding = game.buildings.find(building => building.id === selected)
  const selectedDef = selectedBuilding ? BUILDING_MAP[selectedBuilding.type] : null
  const selectedOperation = selectedBuilding ? game.economy.buildingOperations[selectedBuilding.id] : null
  const available = useMemo(() => BUILDINGS.filter(building => building.category === category), [category])
  const levelInfo = levelProgress(game.stats.population)
  const mission = activeMission(game)
  const missionCurrent = mission ? missionValue(game, mission) : 0
  const missionReady = mission ? missionComplete(game, mission) : false
  const finances = budgetBreakdown(game)
  const storedGoods = inventoryTotal(game.economy.inventory)
  const blockedOperations = Object.values(game.economy.buildingOperations).filter(operation => operation.statusTone === 'blocked').slice(0, 4)
  const scenarioReadiness = threatReadiness(game, scenario)

  const notify = (title: string, body: string, priority: Notification['priority'] = 'low') => setToast({ id: Date.now(), title, body, priority })

  const guideToBuilding = (buildingType: string) => {
    const definition = BUILDING_MAP[buildingType]
    if (!definition) return
    if (!isUnlocked(buildingType, game.stats.level)) { notify('Công trình chưa mở khóa', `${definition.name} cần thành phố cấp ${unlockLevel(buildingType)}.`, 'high'); return }
    setCategory(definition.category)
    setBuildOpen(true)
    setTool(buildingType)
    setSelected(null)
    setPlacementPreview(null)
    setMissionsOpen(false)
    setInsightsOpen(false)
    notify(`Đã chọn ${definition.name}`, 'Đặt công trình vào ô trống cạnh đường để tiếp tục chuỗi hướng dẫn.')
  }

  useEffect(() => {
    if (!started) return
    const handleBuildShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.defaultPrevented || event.repeat || target?.matches('input, textarea, select, [contenteditable="true"]')) return

      const digit = Number(event.key)
      if (event.altKey && !event.ctrlKey && !event.metaKey && digit >= 1 && digit <= categories.length) {
        event.preventDefault()
        setCategory(categories[digit - 1].id)
        setBuildOpen(true)
        return
      }
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

      if (event.key.toLowerCase() === 'b') {
        event.preventDefault()
        setBuildOpen(!buildOpen)
        if (buildOpen) {
          setTool('inspect')
          setPlacementPreview(null)
          setRotation(0)
        }
        return
      }
      if (event.key.toLowerCase() === 'x') {
        event.preventDefault()
        setTool('bulldoze')
        setSelected(null)
        setPlacementPreview(null)
        return
      }
      if (!buildOpen || digit < 1 || digit > 9) return

      const definition = available[digit - 1]
      if (!definition) return
      event.preventDefault()
      if (!isUnlocked(definition.id, game.stats.level)) {
        notify('Công trình chưa mở khóa', `${definition.name} cần thành phố cấp ${unlockLevel(definition.id)}.`, 'high')
        return
      }
      setTool(definition.id)
      setSelected(null)
      setPlacementPreview(null)
    }

    window.addEventListener('keydown', handleBuildShortcut)
    return () => window.removeEventListener('keydown', handleBuildShortcut)
  }, [available, buildOpen, game.stats.level, started])

  const begin = (state: GameState) => {
    lastDay.current = state.day
    lastLevel.current = state.stats.level
    simulationHours.current = 0
    history.current = { past: [], future: [] }
    setGame(state)
    setStarted(true)
  }

  const planPlacement = (tiles: GridPoint[]): PlacementPlan => {
    const unique = [...new Map(tiles.map(point => [`${point.x}:${point.y}`, point])).values()]
    const limited = unique.slice(0, 64), overflow = unique.slice(64)
    const occupied = new Map(game.buildings.map(building => [`${building.x}:${building.y}`, building]))

    if (tool === 'bulldoze') {
      const valid = limited.filter(point => occupied.has(`${point.x}:${point.y}`))
      const invalid = [...limited.filter(point => !occupied.has(`${point.x}:${point.y}`)), ...overflow]
      const refund = valid.reduce((sum, point) => sum + Math.round(BUILDING_MAP[occupied.get(`${point.x}:${point.y}`)!.type].cost * .25), 0)
      return { valid, invalid, cost: 0, refund, affordable: true, message: valid.length ? `Phá dỡ ${valid.length} công trình · hoàn ${money(refund)}` : 'Kéo qua công trình cần phá dỡ' }
    }

    const definition = BUILDING_MAP[tool]
    if (!definition) return { valid: [], invalid: unique, cost: 0, refund: 0, affordable: false, message: 'Chọn một công trình để bắt đầu' }
    if (!isUnlocked(definition.id, game.stats.level)) return { valid: [], invalid: unique, cost: 0, refund: 0, affordable: false, message: `${definition.name} mở khóa ở cấp ${unlockLevel(definition.id)}` }
    const roads = game.buildings.filter(building => building.type === 'road')
    let valid: GridPoint[] = [], invalid: GridPoint[] = [...overflow]
    if (definition.id === 'road') {
      const existingRoad = new Set(roads.map(road => `${road.x}:${road.y}`))
      const empty = limited.filter(point => !occupied.has(`${point.x}:${point.y}`))
      invalid = [...invalid, ...limited.filter(point => occupied.has(`${point.x}:${point.y}`) && !existingRoad.has(`${point.x}:${point.y}`))]
      const connected = !roads.length || limited.some(point => existingRoad.has(`${point.x}:${point.y}`) || adjacentTo(point, existingRoad))
      if (connected) valid = empty
      else invalid = [...invalid, ...empty]
    } else {
      const roadKeys = new Set(roads.map(road => `${road.x}:${road.y}`))
      limited.forEach(point => {
        if (!occupied.has(`${point.x}:${point.y}`) && (!roads.length || adjacentTo(point, roadKeys))) valid.push(point)
        else invalid.push(point)
      })
    }
    const cost = valid.length * definition.cost, affordable = cost <= game.stats.money
    const message = !valid.length ? definition.id === 'road' ? 'Đường mới phải nối với mạng đường hiện tại' : 'Chỉ các ô trống cạnh đường mới có thể xây' : !affordable ? `Thiếu ${money(cost - game.stats.money)} để xác nhận` : `${valid.length} ô hợp lệ · tổng ${money(cost)}`
    return { valid, invalid, cost, refund: 0, affordable, message }
  }

  const place = (tiles: GridPoint[]) => {
    const plan = planPlacement(tiles)
    if (!plan.valid.length) { notify(tool === 'bulldoze' ? 'Không có gì để phá dỡ' : 'Không thể xây vùng này', plan.message, 'high'); return }
    if (!plan.affordable) { notify('Ngân sách không đủ', plan.message, 'high'); return }
    if (tool === 'bulldoze') {
      const keys = new Set(plan.valid.map(point => `${point.x}:${point.y}`))
      setGame(previous => {
        history.current.past.push(previous); if (history.current.past.length > 25) history.current.past.shift(); history.current.future = []
        const next = { ...previous, buildings: previous.buildings.filter(building => !keys.has(`${building.x}:${building.y}`)), stats: { ...previous.stats, money: previous.stats.money + plan.refund } }
        return recalculateState(next)
      })
      setSelected(null)
      if (plan.valid.length > 1) notify('Đã giải phóng khu đất', `${plan.valid.length} công trình được dỡ bỏ · hoàn ${money(plan.refund)}.`)
      return
    }

    const definition = BUILDING_MAP[tool]
    if (!definition) return
    const rot = rotation
    setGame(previous => {
      history.current.past.push(previous); if (history.current.past.length > 25) history.current.past.shift(); history.current.future = []
      const additions = plan.valid.map(point => ({ id: crypto.randomUUID(), type: definition.id, x: point.x, y: point.y, level: 1, health: 100, rotation: rot }))
      const next = { ...previous, buildings: [...previous.buildings, ...additions], stats: { ...previous.stats, money: previous.stats.money - plan.cost } }
      return recalculateState(next)
    })
    if (plan.valid.length > 1) notify('Đã hoàn thành xây dựng', `${plan.valid.length} ${definition.name.toLowerCase()} đã được đặt với tổng chi phí ${money(plan.cost)}.`)
  }

  // Editor-style undo/redo over player actions only; the sim clock keeps running.
  const commit = (label: string, mutate: (previous: GameState) => GameState) => setGame(previous => {
    history.current.past.push(previous); if (history.current.past.length > 25) history.current.past.shift(); history.current.future = []
    void label
    return mutate(previous)
  })

  const undo = () => {
    const previous = history.current.past.pop()
    if (!previous) { notify('Không còn thao tác để hoàn tác', 'Undo chỉ áp dụng cho xây, phá, nâng cấp và di dời.', 'high'); return }
    setGame(current => { history.current.future.push(current); return recalculateState({ ...current, buildings: previous.buildings, stats: { ...current.stats, money: previous.stats.money } }) })
  }

  const redo = () => {
    const upcoming = history.current.future.pop()
    if (!upcoming) { notify('Không còn thao tác để làm lại', 'Nhấn Ctrl+Y sau khi hoàn tác để khôi phục.', 'high'); return }
    setGame(current => { history.current.past.push(current); return recalculateState({ ...current, buildings: upcoming.buildings, stats: { ...current.stats, money: upcoming.stats.money } }) })
  }

  const rotate = () => setRotation(value => ((value + 1) % 4) as RotationStep)

  const moveBuilding = (id: string, target: GridPoint): boolean => {
    const building = game.buildings.find(item => item.id === id)
    if (!building) return false
    if (game.buildings.some(other => other.id !== id && other.x === target.x && other.y === target.y)) { notify('Ô đất đang bận', 'Chọn một ô trống cạnh đường để dời công trình.', 'high'); return false }
    const roads = new Set(game.buildings.filter(item => item.type === 'road').map(item => `${item.x}:${item.y}`))
    if (building.type !== 'road' && roads.size && !adjacentTo(target, roads)) { notify('Ngoài phạm vi kết nối', 'Công trình cần nằm cạnh một ô đường.', 'high'); return false }
    commit('move', previous => ({ ...previous, buildings: previous.buildings.map(item => item.id === id ? { ...item, x: target.x, y: target.y } : item) }))
    notify('Đã di dời công trình', `${BUILDING_MAP[building.type]?.name ?? 'Công trình'} vừa được chuyển tới ô (${target.x + 1}, ${target.y + 1}).`)
    return true
  }

  const rotateSelected = () => {
    if (!selectedBuilding) return
    commit('rotate', previous => ({ ...previous, buildings: previous.buildings.map(item => item.id === selectedBuilding.id ? { ...item, rotation: (((item.rotation ?? 0) + 1) % 4) as RotationStep } : item) }))
  }

  const cancelBuild = () => { setTool('inspect'); setPlacementPreview(null); setRotation(0) }

  const upgrade = () => {
    if (!selectedBuilding || !selectedDef) return
    const max = selectedDef.maxLevel ?? 4
    if (selectedBuilding.level >= max) { notify('Đã đạt cấp tối đa', `${selectedDef.name} đã phát triển hoàn chỉnh.`); return }
    const cost = Math.round(selectedDef.cost * (.65 + selectedBuilding.level * .35))
    if (game.stats.money < cost) { notify('Ngân sách không đủ', `Nâng cấp cần ${money(cost)}.`, 'high'); return }
    commit('upgrade', previous => {
      const next = { ...previous, buildings: previous.buildings.map(building => building.id === selectedBuilding.id ? { ...building, level: building.level + 1 } : building), stats: { ...previous.stats, money: previous.stats.money - cost } }
      return recalculateState(next)
    })
  }

  const repair = () => {
    if (!selectedBuilding || !selectedDef || selectedBuilding.health >= 100) return
    const cost = repairCost(selectedDef.cost, selectedBuilding.health)
    if (game.stats.money < cost) { notify('Ngân sách không đủ', `Sửa chữa cần ${money(cost)}.`, 'high'); return }
    commit('repair', previous => {
      const next = { ...previous, buildings: previous.buildings.map(building => building.id === selectedBuilding.id ? { ...building, health: 100 } : building), stats: { ...previous.stats, money: previous.stats.money - cost } }
      return recalculateState(next)
    })
    notify('Công trình đã phục hồi', `${selectedDef.name} đã vận hành bình thường.`)
  }

  const claimMission = () => {
    if (!mission || !missionReady) return
    setGame(previous => ({ ...previous, stats: { ...previous.stats, money: previous.stats.money + mission.reward }, progress: { ...previous.progress, claimedMissions: [...previous.progress.claimedMissions, mission.id] } }))
    notify('Hoàn thành nhiệm vụ', `Thành phố nhận ${money(mission.reward)} tiền thưởng.`)
  }

  const togglePolicy = (policyId: PolicyId, requiredLevel: number) => {
    if (game.stats.level < requiredLevel) { notify('Chính sách chưa mở', `Cần đạt cấp ${requiredLevel} để ban hành.`, 'high'); return }
    setGame(previous => {
      const active = previous.progress.activePolicies.includes(policyId)
      const activePolicies = active ? previous.progress.activePolicies.filter(id => id !== policyId) : [...previous.progress.activePolicies, policyId]
      const next = { ...previous, progress: { ...previous.progress, activePolicies } }
      return recalculateState(next)
    })
  }

  const triggerDisaster = () => {
    if (game.disaster) return
    const info = DISASTERS[scenario]
    setGame(previous => recalculateState({ ...previous, disaster: { kind: scenario, phase: 'warning', progress: 0, severity: info.severity, response: 0 } }))
    notify(`CẢNH BÁO: ${info.name.toUpperCase()}`, `${info.warning}. Chuẩn bị: ${info.preparation}.`, 'critical')
  }

  const emergencyResponse = () => {
    if (!game.disaster) return
    const cost = 500 + game.disaster.severity * 80
    if (game.stats.money < cost) { notify('Không đủ ngân sách khẩn cấp', `Cần ${money(cost)} để huy động lực lượng.`, 'high'); return }
    if ((game.disaster.response ?? 0) >= 54) { notify('Đã huy động tối đa', 'Các lực lượng hiện có đều đã tham gia ứng phó.'); return }
    setGame(previous => ({ ...previous, stats: { ...previous.stats, money: previous.stats.money - cost }, disaster: previous.disaster ? { ...previous.disaster, response: Math.min(54, (previous.disaster.response ?? 0) + 18) } : null }))
    notify('Lực lượng khẩn cấp đã xuất phát', `Khả năng ứng phó tăng thêm 18 điểm · chi phí ${money(cost)}.`)
  }

  const setWorkPriority = (priority: WorkforcePriority) => {
    if (!selectedBuilding || !selectedOperation) return
    setGame(previous => updateBuildingWorkSetting(previous, selectedBuilding.id, { priority }))
  }

  const toggleOperation = () => {
    if (!selectedBuilding || !selectedOperation) return
    setGame(previous => updateBuildingWorkSetting(previous, selectedBuilding.id, { paused: !selectedOperation.paused }))
  }

  const deliverContract = (contract: TradeContract) => {
    if (!canFulfillTradeContract(game, contract)) { notify('Chưa đủ hàng để giao', resourceRequirement(contract), 'high'); return }
    setGame(previous => fulfillTradeContract(previous, contract.id))
    notify('Hợp đồng đã hoàn thành', `Nhận ${money(contract.reward)} và +${contract.reputation} uy tín thương mại.`)
  }

  if (!started) return <div className="game-menu">
    <div className="menu-backdrop"/><div className="menu-vignette"/>
    <header className="menu-top"><div className="game-logo"><i>H</i><div><strong>HAVEN</strong><span>CITY</span></div></div><div className="menu-status"><i/> CITY NETWORK ONLINE</div></header>
    <main className="menu-content"><p className="menu-kicker">XÂY DỰNG · THÍCH NGHI · PHÁT TRIỂN</p><h1>Thành phố của bạn.<br/><em>Tương lai của họ.</em></h1><p>Khởi đầu với 35.000 ₫ và một khu dân cư nhỏ. Mở đường, thu hút cư dân, cân bằng ngân sách và bảo vệ Haven trước khí hậu khắc nghiệt.</p><div className="menu-actions">{hasSave() && <button className="play-button" onClick={() => begin(loadGame() ?? initialState())}><i>▶</i><span><small>TIẾP TỤC</small>New Haven · Ngày gần nhất</span></button>}<button className={hasSave() ? 'new-city' : 'play-button'} onClick={() => begin(initialState())}>{!hasSave() && <i>▶</i>}<span><small>{hasSave() ? 'KHỞI ĐẦU MỚI' : 'BẮT ĐẦU HÀNH TRÌNH'}</small>35.000 ₫ · 6 cư dân</span></button></div></main>
    <footer className="menu-footer"><span>FOUNDATION BUILD 0.3</span><span>Babylon.js · Autosave · Việt Nam</span><span>⚙ Cài đặt &nbsp; ? Trợ giúp</span></footer>
  </div>

  return <div className={`game weather-${game.weather.replace(' ', '-')}`}>
    <header className="topbar"><div className="mini-brand"><i>H</i><span>HAVEN</span></div><div className="city-name"><span>THÀNH PHỐ</span><strong>New Haven</strong></div><div className="metrics">
      <Metric icon="₫" value={money(game.stats.money)} label={`${game.stats.income >= 0 ? '+' : ''}${money(game.stats.income)}/ngày`} good={game.stats.income >= 0}/><Metric icon="♟" value={game.stats.population.toLocaleString('vi-VN')} label={`${game.stats.housingCapacity} chỗ ở · ${populationPulse(game)}`}/><Metric icon="♥" value={`${game.stats.happiness}%`} label={`Thất nghiệp ${game.stats.unemployment}%`} good={game.stats.happiness > 65}/><Metric icon="ϟ" value={`${game.stats.powerUse}/${game.stats.power}`} label="Điện MW" good={game.stats.powerUse <= game.stats.power}/><Metric icon="●" value={`${game.stats.waterUse}/${game.stats.water}`} label="Nước ML" good={game.stats.waterUse <= game.stats.water}/>
    </div><button className="supply-ribbon" onClick={() => { setInsightsOpen(true); setSelected(null) }} title="Mở báo cáo kinh tế"><span className="supply-workforce"><i>♟</i><b>{game.economy.workforce.employed}/{game.economy.workforce.available}</b></span>{TOP_RESOURCE_IDS.map(resource => <span key={resource} title={RESOURCE_META[resource].label}><i>{RESOURCE_META[resource].icon}</i><b>{formatQuantity(game.economy.inventory[resource])}</b></span>)}<em className={storedGoods >= game.economy.capacity * .9 ? 'warning' : ''}>{Math.round(storedGoods)}/{game.economy.capacity}</em></button><div className="clock"><span>NGÀY {game.day}</span><strong>{String(Math.floor(game.hour)).padStart(2, '0')}:{String(Math.floor((game.hour % 1) * 60)).padStart(2, '0')}</strong><small>{game.weather}</small></div><div className="speed">{[0, 1, 2, 4].map(value => <button className={speed === value ? 'active' : ''} onClick={() => setSpeed(value)} key={value}>{value === 0 ? 'Ⅱ' : `${value}×`}</button>)}</div></header>
    <Suspense fallback={<div className="engine-loading"><i/><span>Đang khởi động thế giới 3D</span></div>}><CityCanvas state={game} tool={tool} overlay={overlay} rotation={rotation} selected={selected} planPlacement={planPlacement} onPlace={place} onPreview={setPlacementPreview} onCancel={cancelBuild} onSelect={setSelected} onRotate={rotate} onMoveBuilding={moveBuilding} moveRequest={moveRequest} onUndo={undo} onRedo={redo}/></Suspense>

    {tool !== 'inspect' && <div className={`build-command ${placementPreview && (!placementPreview.affordable || !placementPreview.valid.length) ? 'invalid' : ''}`}><i style={{ background: tool === 'bulldoze' ? '#a94739' : BUILDING_MAP[tool]?.color }}>{tool === 'bulldoze' ? '♜' : BUILDING_MAP[tool]?.icon}</i><div><span>{tool === 'bulldoze' ? 'CHẾ ĐỘ PHÁ DỠ' : 'ĐANG XÂY DỰNG'}</span><strong>{tool === 'bulldoze' ? 'Chọn vùng cần dỡ bỏ' : BUILDING_MAP[tool]?.name}</strong><small>{placementPreview?.message ?? (tool === 'road' ? 'Giữ chuột và kéo để tạo một đoạn đường thẳng' : 'Bấm một ô hoặc giữ chuột và kéo để chọn vùng')}</small></div><em>{placementPreview && placementPreview.valid.length > 0 ? tool === 'bulldoze' ? `+${money(placementPreview.refund)}` : money(placementPreview.cost) : tool === 'bulldoze' ? 'KÉO CHỌN VÙNG' : 'BẤM HOẶC KÉO'}</em><button onClick={cancelBuild}>Hủy <kbd>Esc</kbd></button></div>}

    <button className="level-card" onClick={() => setMissionsOpen(true)}><div className="level-ring">{levelInfo.level}</div><div><span>{cityTitles[levelInfo.level - 1] ?? 'Thành phố tương lai'}</span><strong>Cấp {levelInfo.level}</strong><div className="progress"><i style={{ width: `${levelInfo.percent}%` }}/></div><small>{levelInfo.current} / {levelInfo.required} cư dân tới cấp sau</small></div></button>
    {mission && <button className={`mission-tracker ${missionReady ? 'ready' : ''}`} onClick={() => setMissionsOpen(true)}><i>{missionReady ? '✓' : '◆'}</i><span><small>NHIỆM VỤ HIỆN TẠI</small><strong>{mission.title}</strong><em>{missionCurrent} / {mission.target} {mission.unit}</em></span><b>{money(mission.reward)}</b></button>}

    <div className="overlay-bar"><span>LỚP THÔNG TIN</span>{OVERLAY_OPTIONS.map(value => <button key={value} className={overlay === value ? 'active' : ''} onClick={() => setOverlay(value)} title={OVERLAY_HINTS[value]}>{({ none: '◉ Bình thường', power: 'ϟ Điện', water: '● Nước', happiness: '♥ Hạnh phúc', flood: '≋ Rủi ro', population: '♟ Dân số', medical: '✚ Y tế', safety: '⛨ An ninh', protection: '⛨ Vùng phủ', traffic: '⌁ Giao thông' } as Record<Overlay, string>)[value]}</button>)}<select value={scenario} onChange={event => setScenario(event.target.value as DisasterKind)}>{Object.entries(DISASTERS).map(([kind, item]) => <option key={kind} value={kind}>{item.icon} {item.name}</option>)}</select><button className="disaster-btn" onClick={triggerDisaster}>⚠ Diễn tập · {scenarioReadiness.score}%</button></div>

    {buildOpen && <aside className="build-panel"><div className="panel-title"><div><span>QUY HOẠCH</span><h2>Xây dựng</h2></div><button onClick={() => setBuildOpen(false)}>×</button></div><div className="build-guidance"><i>↔</i><span><strong>Kéo công trình ra bản đồ</strong>Chọn công trình hoặc dùng phím số, sau đó bấm/kéo trên bản đồ.<small><kbd>B</kbd> đóng/mở · <kbd>X</kbd> phá dỡ · <kbd>R</kbd> xoay</small></span></div><div className="category-list">{categories.map((item, index) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)} title={`Alt+${index + 1}: ${item.label}`}><i>{item.icon}</i>{item.label}<kbd>Alt+{index + 1}</kbd></button>)}</div><div className="building-list">{available.map((item, index) => {
      const unlocked = isUnlocked(item.id, game.stats.level)
      const effects = buildingEffectBadges(item).slice(0, 3)
      return <button key={item.id} draggable={unlocked} disabled={!unlocked} className={`${tool === item.id ? 'active' : ''} ${!unlocked ? 'locked' : ''}`} onDragStart={event => { event.dataTransfer.setData('text/plain', item.id); event.dataTransfer.effectAllowed = 'copy'; setTool(item.id); setSelected(null); setPlacementPreview(null) }} onClick={() => { if (unlocked) { setTool(item.id); setSelected(null); setPlacementPreview(null) } }}>{item.assetPath ? <img src={assetImage(item.assetPath, 1)} alt=""/> : <i style={{ background: item.color }}>{item.icon}</i>}<div className="build-card-copy"><strong>{item.name}</strong><small>{unlocked ? `${money(item.cost)} · −${money(item.upkeep)}/ngày` : `Mở khóa ở cấp ${unlockLevel(item.id)}`}</small>{unlocked && <span className="effect-chips">{effects.map(effect => <em key={effect.label} className={effect.tone}><i>{effect.icon}</i>{effect.label}</em>)}</span>}</div><span className="build-card-action">{index < 9 && <kbd>{index + 1}</kbd>}<b>{unlocked ? tool === item.id ? '✓' : '+' : '◆'}</b></span></button>
    })}</div></aside>}

    {selectedBuilding && selectedDef && <aside className="detail-panel">
      <button className="close" onClick={() => setSelected(null)}>×</button>
      <div className="detail-art" style={{ '--accent': selectedDef.color } as CSSProperties}>{selectedDef.assetPath ? <img src={assetImage(selectedDef.assetPath, selectedBuilding.level)} alt={selectedDef.name}/> : <i>{selectedDef.icon}</i>}<span>CẤP {selectedBuilding.level} / {selectedDef.maxLevel ?? 4}</span></div>
      <p className="eyebrow">{categories.find(item => item.id === selectedDef.category)?.label}</p>
      <h2>{selectedDef.levelNames?.[selectedBuilding.level - 1] ?? selectedDef.name}</h2>
      <p>{selectedDef.description}</p>
      {selectedOperation && <section className={`operation-card ${selectedOperation.statusTone}`}>
        <div><span>VẬN HÀNH THỰC TẾ</span><b>{selectedOperation.efficiency}%</b></div>
        <strong>{selectedOperation.status}</strong>
        <small>{selectedOperation.filledWorkers}/{selectedOperation.requiredWorkers} lao động · {selectedOperation.flow}</small>
        <i><em style={{ width: `${selectedOperation.efficiency}%` }}/></i>
        <footer><span>Doanh thu <b>+{money(selectedOperation.dailyRevenue)}</b></span><span>Lương <b>−{money(selectedOperation.dailyCost)}</b></span></footer>
        <div className="work-controls"><span>Ưu tiên nhân lực</span><div>{([0, 1, 2] as WorkforcePriority[]).map(priority => <button key={priority} className={selectedOperation.priority === priority ? 'active' : ''} onClick={() => setWorkPriority(priority)}>{priority === 0 ? 'Thấp' : priority === 1 ? 'Vừa' : 'Cao'}</button>)}</div><button className={selectedOperation.paused ? 'resume' : 'pause'} onClick={toggleOperation}>{selectedOperation.paused ? 'Tiếp tục vận hành' : 'Tạm dừng cơ sở'}</button></div>
      </section>}
      <div className="effect-summary"><strong>TÁC DỤNG Ở CẤP {selectedBuilding.level}</strong><div className="effect-chips detail-effects">{buildingEffectBadges(selectedDef, selectedBuilding.level).map(effect => <em key={effect.label} className={effect.tone}><i>{effect.icon}</i>{effect.label}</em>)}</div></div>
      {SERVICE_TYPES.has(selectedBuilding.type) && <p className="service-reach">Bán kính phục vụ hiện tại: <b>{Math.round(serviceReach(selectedBuilding.type, selectedBuilding.level) * 10) / 10} ô</b> · {serviceLabel(selectedBuilding.type)}</p>}
      <div className="health"><span>Tình trạng</span><b>{selectedBuilding.health}%</b><i><em style={{ width: `${selectedBuilding.health}%` }}/></i></div>
      <div className="detail-grid"><span>Vận hành<b>−{money(Math.round(selectedDef.upkeep * (1 + (selectedBuilding.level - 1) * .45)))}</b></span><span>Hạnh phúc<b>+{Math.round((selectedDef.happiness ?? 0) * (1 + (selectedBuilding.level - 1) * .45))}</b></span><span>Điện<b>{Math.round((selectedDef.power ?? 0) * (1 + (selectedBuilding.level - 1) * .45))} MW</b></span><span>Nước<b>{Math.round((selectedDef.water ?? 0) * (1 + (selectedBuilding.level - 1) * .45))} ML</b></span></div>
      <div className="detail-actions">{selectedBuilding.type !== 'road' && <button className="rotate" onClick={rotateSelected}>Xoay mặt tiền <kbd>R</kbd></button>}{selectedBuilding.type !== 'road' && <button className="move" onClick={() => { setMoveRequest({ id: selectedBuilding.id, nonce: Date.now() }); notify('Chế độ di dời', `Chạm một ô đất trống cạnh đường để dời ${selectedDef.name}. Nhấn Esc để hủy.`, 'low') }}>Di dời công trình</button>}</div>
      {selectedBuilding.health < 100 && <button className="repair" onClick={repair}>Sửa chữa công trình <b>{money(repairCost(selectedDef.cost, selectedBuilding.health))}</b></button>}
      <button className="upgrade" disabled={selectedBuilding.level >= (selectedDef.maxLevel ?? 4)} onClick={upgrade}>{selectedBuilding.level >= (selectedDef.maxLevel ?? 4) ? 'Đã đạt cấp tối đa' : `Nâng lên cấp ${selectedBuilding.level + 1}`}<b>{selectedBuilding.level < (selectedDef.maxLevel ?? 4) && money(Math.round(selectedDef.cost * (.65 + selectedBuilding.level * .35)))}</b></button>
    </aside>}

    {insightsOpen && !selectedBuilding && <aside className="insight-panel economy-panel">
      <button className="close" onClick={() => setInsightsOpen(false)}>×</button><p className="eyebrow">KINH TẾ THỜI GIAN THỰC</p><h2>Chuỗi cung ứng Haven</h2>
      <div className="workforce-card"><div><span>LAO ĐỘNG</span><strong>{game.economy.workforce.employed}/{game.economy.workforce.available}</strong></div><p>{game.economy.workforce.assignedToProduction} người trong chuỗi sản xuất · {game.economy.workforce.unfilled} vị trí còn trống</p><i><em style={{ width: `${game.economy.workforce.available ? game.economy.workforce.employed / game.economy.workforce.available * 100 : 0}%` }}/></i></div>
      <h3>Kho hàng · {Math.round(storedGoods)}/{game.economy.capacity}</h3>
      <div className="inventory-grid">{(Object.entries(RESOURCE_META) as [ResourceId, (typeof RESOURCE_META)[ResourceId]][]).map(([resource, meta]) => <span key={resource}><i>{meta.icon}</i><small>{meta.label}</small><b>{formatQuantity(game.economy.inventory[resource])}</b></span>)}</div>
      <div className="resource-health"><span>Rừng tái tạo <b>{Math.round(game.economy.resources.forestHealth)}%</b></span><i><em style={{ width: `${game.economy.resources.forestStock}%` }}/></i><span>Nguồn cá <b>{Math.round(game.economy.resources.fishHealth)}%</b></span><i><em style={{ width: `${game.economy.resources.fishStock}%` }}/></i><span>Trữ lượng quặng <b>{Math.round(game.economy.resources.oreHealth)}%</b></span><i><em style={{ width: `${game.economy.resources.oreStock}%` }}/></i></div>
      <h3>Chuỗi liên kết sản xuất</h3>
      <div className="supply-chains">{SUPPLY_CHAINS.map(chain => {
        const completedStages = chain.stages.filter(stage => game.buildings.some(building => stage.types.some(type => type === building.type))).length
        return <section key={chain.id} className={completedStages === chain.stages.length ? 'complete' : ''}><header><i>{chain.icon}</i><span><strong>{chain.title}</strong><small>{chain.description}</small></span><b>{completedStages}/{chain.stages.length}</b></header><div>{chain.stages.map((stage, index) => {
          const built = game.buildings.some(building => stage.types.some(type => type === building.type))
          const operating = Object.values(game.economy.buildingOperations).some(operation => stage.types.some(type => type === operation.type) && operation.efficiency > 0)
          return <button key={stage.label} className={`${built ? 'built' : ''} ${operating ? 'operating' : ''}`} onClick={() => guideToBuilding(stage.buildType)}><i>{operating ? '✓' : built ? '○' : index + 1}</i><span>{stage.label}</span>{index < chain.stages.length - 1 && <em>→</em>}</button>
        })}</div></section>
      })}</div>
      <h3>Sổ thu chi mỗi ngày</h3>
      <div className="budget-lines economy-ledger"><span>Bán hàng nội địa <b>+{money(finances.sales)}</b></span><span>Xuất khẩu & liên vùng <b>+{money(finances.exports)}</b></span><span>Thuế lương & doanh nghiệp <b>+{money(finances.householdTax + finances.businessTax)}</b></span>{finances.starterGrant > 0 && <span>Trợ cấp khởi nghiệp <b>+{money(finances.starterGrant)}</b></span>}<span>Tiền lương <b className="expense">−{money(finances.wages)}</b></span><span>Bảo trì & chính sách <b className="expense">−{money(finances.upkeep + finances.policies)}</b></span><strong>Dòng tiền ròng <b className={finances.net >= 0 ? 'positive' : 'negative'}>{finances.net >= 0 ? '+' : ''}{money(finances.net)}</b></strong></div>
      <h3>Hợp đồng giao thương · Uy tín {game.economy.trade.reputation}</h3>
      <div className="trade-contracts">{game.economy.trade.contracts.map(contract => {
        const ready = canFulfillTradeContract(game, contract)
        return <section key={contract.id} className={ready ? 'ready' : ''}><div><span><strong>{contract.title}</strong><small>{contract.description}</small></span><b>{money(contract.reward)}</b></div><div className="contract-goods">{(Object.entries(contract.requirements) as [ResourceId, number][]).map(([resource, amount]) => <em key={resource} className={game.economy.inventory[resource] >= amount ? 'enough' : ''}><i>{RESOURCE_META[resource].icon}</i>{formatQuantity(game.economy.inventory[resource])}/{amount}</em>)}</div><button disabled={!ready} onClick={() => deliverContract(contract)}>{ready ? `Giao hàng · +${contract.reputation} uy tín` : 'Chưa đủ hàng'}</button></section>
      })}</div>
      {blockedOperations.length > 0 && <><h3>Điểm nghẽn cần xử lý</h3><div className="blocker-list">{blockedOperations.map(operation => <button key={operation.buildingId} onClick={() => { setSelected(operation.buildingId); setInsightsOpen(false) }}><i>!</i><span><strong>{BUILDING_MAP[operation.type]?.name}</strong><small>{operation.status}</small></span><b>{operation.efficiency}%</b></button>)}</div></>}
      <div className="city-advice"><strong>{economyAdvice(game)}</strong><span>{bottleneckDetail(game)}</span></div>
      <details className="city-services"><summary>Dịch vụ & khả năng chống chịu</summary><ServiceBar label="Y tế" value={game.dynamics.services.health}/><ServiceBar label="Giáo dục" value={game.dynamics.services.education}/><ServiceBar label="An ninh" value={game.dynamics.services.safety}/><ServiceBar label="Di chuyển" value={game.dynamics.services.mobility}/><div className="crisis-readiness"><i>{DISASTERS[scenario].icon}</i><span><strong>{DISASTERS[scenario].name}</strong><small>{scenarioReadiness.status} · {scenarioReadiness.score}%</small></span><b>Cảnh báo dự kiến: ngày {game.progress.nextThreatDay}</b></div></details>
    </aside>}

    {missionsOpen && <aside className="mission-panel"><button className="close" onClick={() => setMissionsOpen(false)}>×</button><p className="eyebrow">HÀNH TRÌNH THỊ TRƯỞNG</p><h2>Mục tiêu & chính sách</h2>{mission ? <><section className="active-mission"><div><span>NHIỆM VỤ {game.progress.claimedMissions.length + 1}/{MISSIONS.length}</span><b>{money(mission.reward)}</b></div><h3>{mission.title}</h3><p>{mission.description}</p><div className="mission-progress"><i style={{ width: `${missionCurrent / mission.target * 100}%` }}/></div><small>{missionCurrent} / {mission.target} {mission.unit}</small><button disabled={!missionReady} onClick={claimMission}>{missionReady ? 'Nhận phần thưởng' : 'Hoàn thành các bước bên dưới'}</button></section><div className="mission-guide"><h3>HƯỚNG DẪN THỰC HIỆN</h3>{mission.steps.map((step, index) => {
      const current = missionStepValue(game, step)
      const done = current >= step.target
      const buildType = step.buildType
      return <section key={step.id} className={done ? 'done' : ''}><i>{done ? '✓' : index + 1}</i><div><strong>{step.title}</strong><p>{step.description}</p><small>{current} / {step.target} {step.unit}</small></div>{buildType && <button onClick={() => guideToBuilding(buildType)}>{done ? 'Xây thêm' : 'Đi tới xây'}</button>}</section>
    })}</div></> : <section className="campaign-complete"><i>✓</i><h3>Haven đã trưởng thành</h3><p>Bạn đã hoàn thành toàn bộ chuỗi nhiệm vụ nền móng.</p></section>}<h3 className="policy-heading">CHÍNH SÁCH THÀNH PHỐ</h3><div className="policy-list">{POLICIES.map(policy => {
      const active = game.progress.activePolicies.includes(policy.id)
      const unlocked = game.stats.level >= policy.unlockLevel
      return <button key={policy.id} className={active ? 'active' : ''} onClick={() => togglePolicy(policy.id, policy.unlockLevel)}><i>{active ? '✓' : unlocked ? '○' : '◆'}</i><span><strong>{policy.name}</strong><small>{unlocked ? policy.description : `Mở khóa ở cấp ${policy.unlockLevel}`}</small></span><b>−{money(policy.upkeep)}/ngày</b></button>
    })}</div></aside>}

    <nav className="dock"><button className={buildOpen ? 'active' : ''} onClick={() => { setBuildOpen(!buildOpen); cancelBuild() }} title="Đóng/mở xây dựng (B)"><i>⌂</i>Xây dựng <kbd>B</kbd></button><button className={tool === 'road' ? 'active' : ''} onClick={() => { setBuildOpen(true); setCategory('roads'); setTool('road'); setPlacementPreview(null) }}><i>⌁</i>Đường sá</button><button className={missionsOpen ? 'active' : ''} onClick={() => { setMissionsOpen(!missionsOpen); setSelected(null) }}><i>◆</i>Nhiệm vụ</button><button className={insightsOpen ? 'active' : ''} onClick={() => { setInsightsOpen(!insightsOpen); setSelected(null) }}><i>◔</i>Kinh tế</button><button className={tool === 'inspect' ? 'active' : ''} onClick={cancelBuild}><i>↖</i>Khảo sát</button><button className={tool === 'bulldoze' ? 'danger active' : ''} onClick={() => { setTool('bulldoze'); setPlacementPreview(null); setSelected(null) }} title="Phá dỡ (X)"><i>♜</i>Phá dỡ <kbd>X</kbd></button><button onClick={undo} title="Hoàn tác thao tác xây dựng gần nhất (Ctrl+Z)"><i>↺</i>Hoàn tác</button><button onClick={redo} title="Làm lại thao tác đã hoàn tác (Ctrl+Y)"><i>↻</i>Làm lại</button><button onClick={() => { saveGame(game); notify('Đã lưu thành phố', 'Tiến độ của bạn đã được lưu an toàn.') }}><i>▣</i>Lưu game</button></nav>
    {game.disaster && <div className={`disaster ${game.disaster.phase}`}><i>{DISASTERS[game.disaster.kind].icon}</i><div><span>{game.disaster.phase === 'warning' ? 'CẢNH BÁO SỚM' : game.disaster.phase === 'active' ? 'TÌNH TRẠNG KHẨN CẤP' : 'GIAI ĐOẠN PHỤC HỒI'}</span><strong>{game.disaster.phase === 'recovery' ? 'Thành phố đang phục hồi' : game.disaster.phase === 'active' ? DISASTERS[game.disaster.kind].active : DISASTERS[game.disaster.kind].warning}</strong><small>Sẵn sàng {threatReadiness(game, game.disaster.kind).score}% · ứng phó +{game.disaster.response ?? 0}</small></div>{game.disaster.phase !== 'recovery' && <button onClick={emergencyResponse}>Huy động lực lượng</button>}<em style={{ width: `${Math.min(100, game.disaster.progress / (game.disaster.phase === 'active' ? 45 : game.disaster.phase === 'warning' ? 30 : 25) * 100)}%` }}/></div>}
    {toast && <div className={`toast ${toast.priority}`}><i>{toast.priority === 'critical' ? '⚠' : '✦'}</i><div><strong>{toast.title}</strong><span>{toast.body}</span></div><button onClick={() => setToast(null)}>×</button></div>}
  </div>
}

function Metric({ icon, value, label, good }: { icon: string; value: string; label: string; good?: boolean }) { return <div className="metric"><i className={good === false ? 'bad' : good ? 'good' : ''}>{icon}</i><div><strong>{value}</strong><span>{label}</span></div></div> }
function ServiceBar({ label, value }: { label: string; value: number }) { return <div className="service-bar"><span>{label}</span><i><em style={{ width: `${value}%` }}/></i><b>{value}</b></div> }
function money(value: number) { return `${Math.round(value).toLocaleString('vi-VN')} ₫` }
function formatQuantity(value: number) { return value < 10 && !Number.isInteger(value) ? value.toFixed(1) : Math.round(value).toLocaleString('vi-VN') }
function resourceRequirement(contract: TradeContract) { return `Cần ${Object.entries(contract.requirements).map(([resource, amount]) => `${amount} ${RESOURCE_META[resource as ResourceId].label.toLowerCase()}`).join(' · ')}.` }
function assetImage(base: string, level: number) { return `${base}${level}.png` }
function repairCost(baseCost: number, health: number) { return Math.max(50, Math.round(baseCost * (100 - health) / 100 * .35)) }
function adjacentTo(point: GridPoint, keys: Set<string>) { return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => keys.has(`${point.x + dx}:${point.y + dy}`)) }
function populationPulse(game: GameState) { return game.dynamics.momentum > 5 ? `đang tăng +${Math.max(1, Math.round(game.dynamics.momentum / 6))}` : game.dynamics.momentum < -5 ? 'đang giảm' : 'ổn định' }
function bottleneckDetail(game: GameState) {
  const blocked = Object.values(game.economy.buildingOperations).find(operation => operation.statusTone === 'blocked')
  if (blocked) return `${BUILDING_MAP[blocked.type]?.name ?? 'Công trình'} đang dừng: ${blocked.status.toLowerCase()}. Chọn cảnh báo để tìm đúng công trình.`
  if (inventoryTotal(game.economy.inventory) >= game.economy.capacity * .9) return 'Kho gần đầy. Xây hoặc nâng cấp kho hàng để tránh dây chuyền sản xuất phải dừng.'
  if (game.stats.population >= game.stats.housingCapacity) return 'Đã hết chỗ ở. Xây hoặc nâng cấp nhà dân để đón cư dân mới.'
  if (game.stats.powerUse > game.stats.power) return 'Thiếu điện đang làm giảm chất lượng dịch vụ và sức hút đô thị.'
  if (game.stats.waterUse > game.stats.water) return 'Nguồn nước không đủ cho khu dân cư hiện tại.'
  if (game.dynamics.pressures.jobs > 58) return 'Thiếu việc làm đang làm chậm tốc độ chuyển đến.'
  return 'Thành phố còn chỗ ở, việc làm và hạ tầng phù hợp để tiếp tục tăng dân số.'
}
function economyAdvice(game: GameState) {
  if (game.economy.trade.contracts.some(contract => canFulfillTradeContract(game, contract))) return 'Hàng đã đủ cho một hợp đồng; giao ngay để thu tiền và tăng uy tín.'
  if (game.economy.inventory.fish >= 6 && !game.buildings.some(building => building.type === 'seafood_factory')) return 'Cá tươi đã đủ để chế biến. Xây Xưởng hải sản để nâng giá trị trước khi bán.'
  if (game.economy.inventory.seafood >= 2 && !game.buildings.some(building => ['market', 'supermarket', 'marina'].includes(building.type))) return 'Hải sản chế biến chưa có đầu ra. Xây chợ, siêu thị hoặc bến tàu để chuyển hàng thành doanh thu.'
  if (game.economy.workforce.available > game.economy.workforce.employed) return 'Tạo thêm việc làm có đầu ra rõ ràng.'
  if (game.economy.workforce.assignedToProduction < Object.values(game.economy.buildingOperations).reduce((sum, operation) => sum + operation.requiredWorkers, 0) * .75) return 'Chuỗi sản xuất đang thiếu lao động.'
  if (game.stats.income < 0) return 'Ngân sách đang thâm hụt; xử lý điểm nghẽn trước khi mở rộng.'
  if (game.economy.inventory.food + game.economy.inventory.fish + game.economy.inventory.seafood < 8) return 'Dự trữ thực phẩm thấp; ưu tiên nông trại hoặc bến cá.'
  return 'Kinh tế đang tạo thặng dư; có thể tái đầu tư vào chế biến và kho vận.'
}
