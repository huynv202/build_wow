import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { BUILDINGS, BUILDING_MAP } from './data/buildings'
import { budgetBreakdown, calculateStats, initialState } from './game/simulation'
import { simulateCity } from './game/citySimulation'
import { serviceLabel, serviceReach } from './game/services'
import { applyDisasterDamage, availableThreats, DISASTERS, threatReadiness } from './game/disasters'
import { activeMission, isUnlocked, levelProgress, missionValue, MISSIONS, POLICIES, unlockLevel } from './game/progression'
import { hasSave, loadGame, saveGame } from './game/storage'
import type { Category, DisasterKind, GameState, GridPoint, Notification, Overlay, PlacementPlan, PlacedBuilding, PolicyId, RotationStep, Tool } from './types'
import './styles.css'

const CityCanvas = lazy(() => import('./components/CityCanvas').then(module => ({ default: module.CityCanvas })))

const categories: { id: Category; label: string; icon: string }[] = [
  { id: 'roads', label: 'Đường', icon: '⌁' }, { id: 'transport', label: 'Giao thông', icon: '▰' }, { id: 'homes', label: 'Nhà ở', icon: '⌂' }, { id: 'commerce', label: 'Kinh tế', icon: '◇' },
  { id: 'services', label: 'Dịch vụ', icon: '✚' }, { id: 'utilities', label: 'Hạ tầng', icon: '◫' }, { id: 'nature', label: 'Cảnh quan', icon: '♣' },
]
const weatherCycle: GameState['weather'][] = ['Nắng đẹp', 'Có mây', 'Mưa', 'Mưa lớn', 'Có mây']
const cityTitles = ['Khu định cư mới', 'Thị trấn xanh', 'Đô thị năng động', 'Thành phố đáng sống', 'Trung tâm vùng', 'Siêu đô thị chống chịu']
const OVERLAY_OPTIONS: Overlay[] = ['none', 'power', 'water', 'happiness', 'flood', 'population', 'medical', 'safety', 'protection', 'traffic']
const OVERLAY_HINTS: Record<Overlay, string> = {
  none: 'Chế độ hiển thị tiêu chuẩn', power: 'Nguồn và lưới điện', water: 'Nguồn và lưới nước', happiness: 'Mức độ hài lòng theo khu', flood: 'Ngập lụt, kè biển và thoát nước',
  population: 'Heatmap mật độ dân số', medical: 'Vùng phủ bệnh viện · phòng khám', safety: 'Vùng phủ cảnh sát · cứu hỏa', protection: 'Vùng bảo vệ UV, an ninh và phòng thủ', traffic: 'Ùn tắc giao thông theo màu',
}
const SERVICE_TYPES = new Set(['clinic', 'hospital', 'police', 'fire', 'school', 'university', 'uv_station', 'drain', 'seawall', 'shelter', 'security_hub', 'research_lab', 'defense_tower'])

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
        stats: { ...previous.stats, money: previous.stats.money + previous.stats.income * deltaHours / 24 },
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
      setToast({ id: Date.now(), title: `Báo cáo ngày ${game.day}`, body: `${game.stats.income >= 0 ? 'Ngân sách tăng' : 'Ngân sách giảm'} ${money(Math.abs(game.stats.income))}/ngày · ${populationPulse(game)}.`, priority: game.stats.income >= 0 ? 'low' : 'high' })
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
  const available = useMemo(() => BUILDINGS.filter(building => building.category === category), [category])
  const levelInfo = levelProgress(game.stats.population)
  const mission = activeMission(game)
  const missionCurrent = mission ? missionValue(game, mission) : 0
  const finances = budgetBreakdown(game)
  const scenarioReadiness = threatReadiness(game, scenario)

  const notify = (title: string, body: string, priority: Notification['priority'] = 'low') => setToast({ id: Date.now(), title, body, priority })
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
        return { ...next, stats: calculateStats(next) }
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
      return { ...next, stats: calculateStats(next) }
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
    setGame(current => { history.current.future.push(current); return { ...current, buildings: previous.buildings, stats: { ...current.stats, money: previous.stats.money } } })
  }

  const redo = () => {
    const upcoming = history.current.future.pop()
    if (!upcoming) { notify('Không còn thao tác để làm lại', 'Nhấn Ctrl+Y sau khi hoàn tác để khôi phục.', 'high'); return }
    setGame(current => { history.current.past.push(current); return { ...current, buildings: upcoming.buildings, stats: { ...current.stats, money: upcoming.stats.money } } })
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
      return { ...next, stats: calculateStats(next) }
    })
  }

  const repair = () => {
    if (!selectedBuilding || !selectedDef || selectedBuilding.health >= 100) return
    const cost = repairCost(selectedDef.cost, selectedBuilding.health)
    if (game.stats.money < cost) { notify('Ngân sách không đủ', `Sửa chữa cần ${money(cost)}.`, 'high'); return }
    commit('repair', previous => {
      const next = { ...previous, buildings: previous.buildings.map(building => building.id === selectedBuilding.id ? { ...building, health: 100 } : building), stats: { ...previous.stats, money: previous.stats.money - cost } }
      return { ...next, stats: calculateStats(next) }
    })
    notify('Công trình đã phục hồi', `${selectedDef.name} đã vận hành bình thường.`)
  }

  const claimMission = () => {
    if (!mission || missionCurrent < mission.target) return
    setGame(previous => ({ ...previous, stats: { ...previous.stats, money: previous.stats.money + mission.reward }, progress: { ...previous.progress, claimedMissions: [...previous.progress.claimedMissions, mission.id] } }))
    notify('Hoàn thành nhiệm vụ', `Thành phố nhận ${money(mission.reward)} tiền thưởng.`)
  }

  const togglePolicy = (policyId: PolicyId, requiredLevel: number) => {
    if (game.stats.level < requiredLevel) { notify('Chính sách chưa mở', `Cần đạt cấp ${requiredLevel} để ban hành.`, 'high'); return }
    setGame(previous => {
      const active = previous.progress.activePolicies.includes(policyId)
      const activePolicies = active ? previous.progress.activePolicies.filter(id => id !== policyId) : [...previous.progress.activePolicies, policyId]
      const next = { ...previous, progress: { ...previous.progress, activePolicies } }
      return { ...next, stats: calculateStats(next) }
    })
  }

  const triggerDisaster = () => {
    if (game.disaster) return
    const info = DISASTERS[scenario]
    setGame(previous => ({ ...previous, disaster: { kind: scenario, phase: 'warning', progress: 0, severity: info.severity, response: 0 } }))
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

  if (!started) return <div className="game-menu">
    <div className="menu-backdrop"/><div className="menu-vignette"/>
    <header className="menu-top"><div className="game-logo"><i>H</i><div><strong>HAVEN</strong><span>CITY</span></div></div><div className="menu-status"><i/> CITY NETWORK ONLINE</div></header>
    <main className="menu-content"><p className="menu-kicker">XÂY DỰNG · THÍCH NGHI · PHÁT TRIỂN</p><h1>Thành phố của bạn.<br/><em>Tương lai của họ.</em></h1><p>Khởi đầu với 35.000 ₫ và một khu dân cư nhỏ. Mở đường, thu hút cư dân, cân bằng ngân sách và bảo vệ Haven trước khí hậu khắc nghiệt.</p><div className="menu-actions">{hasSave() && <button className="play-button" onClick={() => begin(loadGame() ?? initialState())}><i>▶</i><span><small>TIẾP TỤC</small>New Haven · Ngày gần nhất</span></button>}<button className={hasSave() ? 'new-city' : 'play-button'} onClick={() => begin(initialState())}>{!hasSave() && <i>▶</i>}<span><small>{hasSave() ? 'KHỞI ĐẦU MỚI' : 'BẮT ĐẦU HÀNH TRÌNH'}</small>35.000 ₫ · 6 cư dân</span></button></div></main>
    <footer className="menu-footer"><span>FOUNDATION BUILD 0.3</span><span>Babylon.js · Autosave · Việt Nam</span><span>⚙ Cài đặt &nbsp; ? Trợ giúp</span></footer>
  </div>

  return <div className={`game weather-${game.weather.replace(' ', '-')}`}>
    <header className="topbar"><div className="mini-brand"><i>H</i><span>HAVEN</span></div><div className="city-name"><span>THÀNH PHỐ</span><strong>New Haven</strong></div><div className="metrics">
      <Metric icon="₫" value={money(game.stats.money)} label={`${game.stats.income >= 0 ? '+' : ''}${money(game.stats.income)}/ngày`} good={game.stats.income >= 0}/><Metric icon="♟" value={game.stats.population.toLocaleString('vi-VN')} label={`${game.stats.housingCapacity} chỗ ở · ${populationPulse(game)}`}/><Metric icon="♥" value={`${game.stats.happiness}%`} label={`Thất nghiệp ${game.stats.unemployment}%`} good={game.stats.happiness > 65}/><Metric icon="ϟ" value={`${game.stats.powerUse}/${game.stats.power}`} label="Điện MW" good={game.stats.powerUse <= game.stats.power}/><Metric icon="●" value={`${game.stats.waterUse}/${game.stats.water}`} label="Nước ML" good={game.stats.waterUse <= game.stats.water}/>
    </div><div className="clock"><span>NGÀY {game.day}</span><strong>{String(Math.floor(game.hour)).padStart(2, '0')}:{String(Math.floor((game.hour % 1) * 60)).padStart(2, '0')}</strong><small>{game.weather}</small></div><div className="speed">{[0, 1, 2, 4].map(value => <button className={speed === value ? 'active' : ''} onClick={() => setSpeed(value)} key={value}>{value === 0 ? 'Ⅱ' : `${value}×`}</button>)}</div></header>
    <Suspense fallback={<div className="engine-loading"><i/><span>Đang khởi động thế giới 3D</span></div>}><CityCanvas state={game} tool={tool} overlay={overlay} rotation={rotation} selected={selected} planPlacement={planPlacement} onPlace={place} onPreview={setPlacementPreview} onCancel={cancelBuild} onSelect={setSelected} onRotate={rotate} onMoveBuilding={moveBuilding} moveRequest={moveRequest} onUndo={undo} onRedo={redo}/></Suspense>

    {tool !== 'inspect' && <div className={`build-command ${placementPreview && (!placementPreview.affordable || !placementPreview.valid.length) ? 'invalid' : ''}`}><i style={{ background: tool === 'bulldoze' ? '#a94739' : BUILDING_MAP[tool]?.color }}>{tool === 'bulldoze' ? '♜' : BUILDING_MAP[tool]?.icon}</i><div><span>{tool === 'bulldoze' ? 'CHẾ ĐỘ PHÁ DỠ' : 'ĐANG XÂY DỰNG'}</span><strong>{tool === 'bulldoze' ? 'Chọn vùng cần dỡ bỏ' : BUILDING_MAP[tool]?.name}</strong><small>{placementPreview?.message ?? (tool === 'road' ? 'Giữ chuột và kéo để tạo một đoạn đường thẳng' : 'Bấm một ô hoặc giữ chuột và kéo để chọn vùng')}</small></div><em>{placementPreview && placementPreview.valid.length > 0 ? tool === 'bulldoze' ? `+${money(placementPreview.refund)}` : money(placementPreview.cost) : tool === 'bulldoze' ? 'KÉO CHỌN VÙNG' : 'BẤM HOẶC KÉO'}</em><button onClick={cancelBuild}>Hủy <kbd>Esc</kbd></button></div>}

    <button className="level-card" onClick={() => setMissionsOpen(true)}><div className="level-ring">{levelInfo.level}</div><div><span>{cityTitles[levelInfo.level - 1] ?? 'Thành phố tương lai'}</span><strong>Cấp {levelInfo.level}</strong><div className="progress"><i style={{ width: `${levelInfo.percent}%` }}/></div><small>{levelInfo.current} / {levelInfo.required} cư dân tới cấp sau</small></div></button>
    {mission && <button className={`mission-tracker ${missionCurrent >= mission.target ? 'ready' : ''}`} onClick={() => setMissionsOpen(true)}><i>{missionCurrent >= mission.target ? '✓' : '◆'}</i><span><small>NHIỆM VỤ HIỆN TẠI</small><strong>{mission.title}</strong><em>{missionCurrent} / {mission.target} {mission.unit}</em></span><b>{money(mission.reward)}</b></button>}

    <div className="overlay-bar"><span>LỚP THÔNG TIN</span>{OVERLAY_OPTIONS.map(value => <button key={value} className={overlay === value ? 'active' : ''} onClick={() => setOverlay(value)} title={OVERLAY_HINTS[value]}>{({ none: '◉ Bình thường', power: 'ϟ Điện', water: '● Nước', happiness: '♥ Hạnh phúc', flood: '≋ Rủi ro', population: '♟ Dân số', medical: '✚ Y tế', safety: '⛨ An ninh', protection: '⛨ Vùng phủ', traffic: '⌁ Giao thông' } as Record<Overlay, string>)[value]}</button>)}<select value={scenario} onChange={event => setScenario(event.target.value as DisasterKind)}>{Object.entries(DISASTERS).map(([kind, item]) => <option key={kind} value={kind}>{item.icon} {item.name}</option>)}</select><button className="disaster-btn" onClick={triggerDisaster}>⚠ Diễn tập · {scenarioReadiness.score}%</button></div>

    {buildOpen && <aside className="build-panel"><div className="panel-title"><div><span>QUY HOẠCH</span><h2>Xây dựng</h2></div><button onClick={() => setBuildOpen(false)}>×</button></div><div className="build-guidance"><i>↔</i><span><strong>Kéo công trình ra bản đồ</strong>Hoặc chọn rồi kéo trên đất để xây đường và quét cả vùng.</span></div><div className="category-list">{categories.map(item => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}><i>{item.icon}</i>{item.label}</button>)}</div><div className="building-list">{available.map(item => {
      const unlocked = isUnlocked(item.id, game.stats.level)
      return <button key={item.id} draggable={unlocked} disabled={!unlocked} className={`${tool === item.id ? 'active' : ''} ${!unlocked ? 'locked' : ''}`} onDragStart={event => { event.dataTransfer.setData('text/plain', item.id); event.dataTransfer.effectAllowed = 'copy'; setTool(item.id); setSelected(null); setPlacementPreview(null) }} onClick={() => { if (unlocked) { setTool(item.id); setSelected(null); setPlacementPreview(null) } }}>{item.assetPath ? <img src={assetImage(item.assetPath, 1)} alt=""/> : <i style={{ background: item.color }}>{item.icon}</i>}<span><strong>{item.name}</strong><small>{unlocked ? `${money(item.cost)} · −${money(item.upkeep)}/ngày` : `Mở khóa ở cấp ${unlockLevel(item.id)}`}</small></span><b>{unlocked ? tool === item.id ? '✓' : '+' : '◆'}</b></button>
    })}</div></aside>}

    {selectedBuilding && selectedDef && <aside className="detail-panel"><button className="close" onClick={() => setSelected(null)}>×</button><div className="detail-art" style={{ '--accent': selectedDef.color } as CSSProperties}>{selectedDef.assetPath ? <img src={assetImage(selectedDef.assetPath, selectedBuilding.level)} alt={selectedDef.name}/> : <i>{selectedDef.icon}</i>}<span>CẤP {selectedBuilding.level} / {selectedDef.maxLevel ?? 4}</span></div><p className="eyebrow">{categories.find(item => item.id === selectedDef.category)?.label}</p><h2>{selectedDef.levelNames?.[selectedBuilding.level - 1] ?? selectedDef.name}</h2><p>{selectedDef.description}</p>{SERVICE_TYPES.has(selectedBuilding.type) && <p className="service-reach">Bán kính phục vụ hiện tại: <b>{Math.round(serviceReach(selectedBuilding.type, selectedBuilding.level) * 10) / 10} ô</b> · {serviceLabel(selectedBuilding.type)}</p>}<div className="health"><span>Tình trạng</span><b>{selectedBuilding.health}%</b><i><em style={{ width: `${selectedBuilding.health}%` }}/></i></div><div className="detail-grid"><span>Vận hành<b>−{money(Math.round(selectedDef.upkeep * (1 + (selectedBuilding.level - 1) * .45)))}</b></span><span>Hạnh phúc<b>+{selectedDef.happiness ?? 0}</b></span><span>Điện<b>{selectedDef.power ?? 0} MW</b></span><span>Nước<b>{selectedDef.water ?? 0} ML</b></span></div><div className="detail-actions">{selectedBuilding.type !== 'road' && <button className="rotate" onClick={rotateSelected}>Xoay mặt tiền <kbd>R</kbd></button>}{selectedBuilding.type !== 'road' && <button className="move" onClick={() => { setMoveRequest({ id: selectedBuilding.id, nonce: Date.now() }); notify('Chế độ di dời', `Chạm một ô đất trống cạnh đường để dời ${selectedDef.name}. Nhấn Esc để hủy.`, 'low') }}>Di dời công trình</button></div>{selectedBuilding.health < 100 && <button className="repair" onClick={repair}>Sửa chữa công trình <b>{money(repairCost(selectedDef.cost, selectedBuilding.health))}</b></button>}<button className="upgrade" disabled={selectedBuilding.level >= (selectedDef.maxLevel ?? 4)} onClick={upgrade}>{selectedBuilding.level >= (selectedDef.maxLevel ?? 4) ? 'Đã đạt cấp tối đa' : `Nâng lên cấp ${selectedBuilding.level + 1}`}<b>{selectedBuilding.level < (selectedDef.maxLevel ?? 4) && money(Math.round(selectedDef.cost * (.65 + selectedBuilding.level * .35)))}</b></button></aside>}

    {insightsOpen && !selectedBuilding && <aside className="insight-panel"><button className="close" onClick={() => setInsightsOpen(false)}>×</button><p className="eyebrow">MÔ PHỎNG ĐÔ THỊ</p><h2>Nhịp sống thành phố</h2><div className="citizen-groups"><span>Gia đình<b>{game.dynamics.groups.families}</b></span><span>Lao động<b>{game.dynamics.groups.workers}</b></span><span>Học sinh<b>{game.dynamics.groups.students}</b></span><span>Cao tuổi<b>{game.dynamics.groups.elderly}</b></span></div><h3>Dịch vụ thiết yếu</h3><ServiceBar label="Y tế" value={game.dynamics.services.health}/><ServiceBar label="Giáo dục" value={game.dynamics.services.education}/><ServiceBar label="An ninh" value={game.dynamics.services.safety}/><ServiceBar label="Di chuyển" value={game.dynamics.services.mobility}/><ServiceBar label="Chống chịu" value={game.dynamics.services.resilience}/><ServiceBar label="Phòng vệ" value={game.dynamics.services.defense}/><h3>Trung tâm khẩn cấp</h3><div className="crisis-readiness"><i>{DISASTERS[scenario].icon}</i><span><strong>{DISASTERS[scenario].name}</strong><small>{scenarioReadiness.status} · {scenarioReadiness.score}%</small></span><b>Ngày cảnh báo dự kiến: {game.progress.nextThreatDay}</b></div><h3>Ngân sách mỗi ngày</h3><div className="budget-lines"><span>Thuế cư dân <b>+{money(finances.populationTax)}</b></span><span>Thuế việc làm <b>+{money(finances.jobTax)}</b></span>{finances.starterGrant > 0 && <span>Trợ cấp khởi nghiệp <b>+{money(finances.starterGrant)}</b></span>}<span>Vận hành <b>−{money(finances.upkeep + finances.policies)}</b></span><strong>Dòng tiền <b>{finances.net >= 0 ? '+' : ''}{money(finances.net)}</b></strong></div><div className="city-advice"><strong>{cityAdvice(game)}</strong><span>{bottleneckDetail(game)}</span></div></aside>}

    {missionsOpen && <aside className="mission-panel"><button className="close" onClick={() => setMissionsOpen(false)}>×</button><p className="eyebrow">HÀNH TRÌNH THỊ TRƯỞNG</p><h2>Mục tiêu & chính sách</h2>{mission ? <section className="active-mission"><div><span>NHIỆM VỤ {game.progress.claimedMissions.length + 1}/{MISSIONS.length}</span><b>{money(mission.reward)}</b></div><h3>{mission.title}</h3><p>{mission.description}</p><div className="mission-progress"><i style={{ width: `${missionCurrent / mission.target * 100}%` }}/></div><small>{missionCurrent} / {mission.target} {mission.unit}</small><button disabled={missionCurrent < mission.target} onClick={claimMission}>{missionCurrent >= mission.target ? 'Nhận phần thưởng' : 'Đang thực hiện'}</button></section> : <section className="campaign-complete"><i>✓</i><h3>Haven đã trưởng thành</h3><p>Bạn đã hoàn thành toàn bộ chuỗi nhiệm vụ nền móng.</p></section>}<h3 className="policy-heading">CHÍNH SÁCH THÀNH PHỐ</h3><div className="policy-list">{POLICIES.map(policy => {
      const active = game.progress.activePolicies.includes(policy.id)
      const unlocked = game.stats.level >= policy.unlockLevel
      return <button key={policy.id} className={active ? 'active' : ''} onClick={() => togglePolicy(policy.id, policy.unlockLevel)}><i>{active ? '✓' : unlocked ? '○' : '◆'}</i><span><strong>{policy.name}</strong><small>{unlocked ? policy.description : `Mở khóa ở cấp ${policy.unlockLevel}`}</small></span><b>−{money(policy.upkeep)}/ngày</b></button>
    })}</div></aside>}

    <nav className="dock"><button className={buildOpen ? 'active' : ''} onClick={() => { setBuildOpen(!buildOpen); cancelBuild() }}><i>⌂</i>Xây dựng</button><button className={tool === 'road' ? 'active' : ''} onClick={() => { setBuildOpen(true); setCategory('roads'); setTool('road'); setPlacementPreview(null) }}><i>⌁</i>Đường sá</button><button className={missionsOpen ? 'active' : ''} onClick={() => { setMissionsOpen(!missionsOpen); setSelected(null) }}><i>◆</i>Nhiệm vụ</button><button className={insightsOpen ? 'active' : ''} onClick={() => { setInsightsOpen(!insightsOpen); setSelected(null) }}><i>◔</i>Nhịp sống</button><button className={tool === 'inspect' ? 'active' : ''} onClick={cancelBuild}><i>↖</i>Khảo sát</button><button className={tool === 'bulldoze' ? 'danger active' : ''} onClick={() => { setTool('bulldoze'); setPlacementPreview(null); setSelected(null) }}><i>♜</i>Phá dỡ</button><button onClick={undo} title="Hoàn tác thao tác xây dựng gần nhất (Ctrl+Z)"><i>↺</i>Hoàn tác</button><button onClick={redo} title="Làm lại thao tác đã hoàn tác (Ctrl+Y)"><i>↻</i>Làm lại</button><button onClick={() => { saveGame(game); notify('Đã lưu thành phố', 'Tiến độ của bạn đã được lưu an toàn.') }}><i>▣</i>Lưu game</button></nav>
    {game.disaster && <div className={`disaster ${game.disaster.phase}`}><i>{DISASTERS[game.disaster.kind].icon}</i><div><span>{game.disaster.phase === 'warning' ? 'CẢNH BÁO SỚM' : game.disaster.phase === 'active' ? 'TÌNH TRẠNG KHẨN CẤP' : 'GIAI ĐOẠN PHỤC HỒI'}</span><strong>{game.disaster.phase === 'recovery' ? 'Thành phố đang phục hồi' : game.disaster.phase === 'active' ? DISASTERS[game.disaster.kind].active : DISASTERS[game.disaster.kind].warning}</strong><small>Sẵn sàng {threatReadiness(game, game.disaster.kind).score}% · ứng phó +{game.disaster.response ?? 0}</small></div>{game.disaster.phase !== 'recovery' && <button onClick={emergencyResponse}>Huy động lực lượng</button>}<em style={{ width: `${Math.min(100, game.disaster.progress / (game.disaster.phase === 'active' ? 45 : game.disaster.phase === 'warning' ? 30 : 25) * 100)}%` }}/></div>}
    {toast && <div className={`toast ${toast.priority}`}><i>{toast.priority === 'critical' ? '⚠' : '✦'}</i><div><strong>{toast.title}</strong><span>{toast.body}</span></div><button onClick={() => setToast(null)}>×</button></div>}
  </div>
}

function Metric({ icon, value, label, good }: { icon: string; value: string; label: string; good?: boolean }) { return <div className="metric"><i className={good === false ? 'bad' : good ? 'good' : ''}>{icon}</i><div><strong>{value}</strong><span>{label}</span></div></div> }
function ServiceBar({ label, value }: { label: string; value: number }) { return <div className="service-bar"><span>{label}</span><i><em style={{ width: `${value}%` }}/></i><b>{value}</b></div> }
function money(value: number) { return `${Math.round(value).toLocaleString('vi-VN')} ₫` }
function assetImage(base: string, level: number) { return `${base}${level}.png` }
function repairCost(baseCost: number, health: number) { return Math.max(50, Math.round(baseCost * (100 - health) / 100 * .35)) }
function adjacentTo(point: GridPoint, keys: Set<string>) { return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => keys.has(`${point.x + dx}:${point.y + dy}`)) }
function populationPulse(game: GameState) { return game.dynamics.momentum > 5 ? `đang tăng +${Math.max(1, Math.round(game.dynamics.momentum / 6))}` : game.dynamics.momentum < -5 ? 'đang giảm' : 'ổn định' }
function bottleneckDetail(game: GameState) {
  if (game.stats.population >= game.stats.housingCapacity) return 'Đã hết chỗ ở. Xây hoặc nâng cấp nhà dân để đón cư dân mới.'
  if (game.stats.powerUse > game.stats.power) return 'Thiếu điện đang làm giảm chất lượng dịch vụ và sức hút đô thị.'
  if (game.stats.waterUse > game.stats.water) return 'Nguồn nước không đủ cho khu dân cư hiện tại.'
  if (game.dynamics.pressures.jobs > 58) return 'Thiếu việc làm đang làm chậm tốc độ chuyển đến.'
  return 'Thành phố còn chỗ ở, việc làm và hạ tầng phù hợp để tiếp tục tăng dân số.'
}
function cityAdvice(game: GameState) {
  if (game.stats.population >= game.stats.housingCapacity) return 'Ưu tiên mở rộng nhà ở.'
  const entries = Object.entries(game.dynamics.services) as [string, number][]
  const [lowest] = entries.sort((a, b) => a[1] - b[1])[0]
  return ({ health: 'Thành phố đang thiếu năng lực y tế.', education: 'Cần đầu tư thêm trường học và đại học.', safety: 'Dịch vụ an toàn chưa phủ đủ dân cư.', mobility: 'Mạng đường chưa theo kịp mật độ dân số.', resilience: 'Thành phố còn dễ tổn thương trước thiên tai.', defense: 'Khả năng phòng vệ trước các mối đe dọa đặc biệt còn thấp.' } as Record<string, string>)[lowest]
}
