import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { BUILDINGS, BUILDING_MAP } from './data/buildings'
import { calculateStats, initialState } from './game/simulation'
import { applyDisasterDamage, DISASTERS } from './game/disasters'
import { hasSave, loadGame, saveGame } from './game/storage'
import type { Category, DisasterKind, GameState, Notification, Overlay, Tool } from './types'
import './styles.css'

const CityCanvas = lazy(() => import('./components/CityCanvas').then(module => ({ default: module.CityCanvas })))

const categories: { id: Category; label: string; icon: string }[] = [
  { id: 'roads', label: 'Đường', icon: '⌁' }, { id: 'homes', label: 'Nhà ở', icon: '⌂' }, { id: 'commerce', label: 'Kinh tế', icon: '◇' },
  { id: 'services', label: 'Dịch vụ', icon: '✚' }, { id: 'utilities', label: 'Hạ tầng', icon: '◫' }, { id: 'nature', label: 'Cảnh quan', icon: '♣' },
]
const weatherCycle: GameState['weather'][] = ['Nắng đẹp', 'Có mây', 'Mưa', 'Mưa lớn', 'Có mây']

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
  const tick = useRef(0)

  useEffect(() => { if (!started || speed === 0) return; const id=setInterval(() => setGame(prev => {
    tick.current++
    let next: GameState = { ...prev, hour: prev.hour + .12 * speed }
    if (next.hour >= 24) { next.hour -= 24; next.day++; next.weather = weatherCycle[next.day % weatherCycle.length] }
    if (tick.current % 10 === 0) { const stats=calculateStats(next); next={...next,stats:{...stats,money:stats.money+Math.round(stats.income/24)}} }
    if (next.disaster) {
      const d={...next.disaster,progress:next.disaster.progress+speed}
      if(d.phase==='warning'&&d.progress>=30){d.phase='active';d.progress=0;next.weather=d.kind==='uv'?'Nắng đẹp':'Mưa lớn'}
      else if(d.phase==='active'&&d.progress>=45){d.phase='recovery';d.progress=0;next={...next,disaster:d};next={...next,buildings:applyDisasterDamage(next)};setToast({id:Date.now(),title:'Nguy hiểm đã qua',body:'Đánh giá thiệt hại và bắt đầu phục hồi thành phố.',priority:'high'})}
      else if(d.phase==='recovery'&&d.progress>=25){next.disaster=null;next.weather='Có mây'} else next.disaster=d
    }
    if (tick.current % 50 === 0) saveGame(next)
    return next
  }), 500); return () => clearInterval(id) }, [started, speed])

  useEffect(() => { if(toast){const id=setTimeout(()=>setToast(null),5000);return()=>clearTimeout(id)} }, [toast])
  const selectedBuilding = game.buildings.find(b => b.id === selected)
  const selectedDef = selectedBuilding ? BUILDING_MAP[selectedBuilding.type] : null
  const available = useMemo(() => BUILDINGS.filter(b => b.category === category), [category])

  const place = (x: number, y: number) => {
    if(tool==='bulldoze'){ const target=game.buildings.find(b=>b.x===x&&b.y===y); if(!target)return; setGame(prev=>{const next={...prev,buildings:prev.buildings.filter(b=>b.id!==target.id),stats:{...prev.stats,money:prev.stats.money+Math.round(BUILDING_MAP[target.type].cost*.25)}};return{...next,stats:calculateStats(next)}});setSelected(null);return }
    const def=BUILDING_MAP[tool]; if(!def)return
    if(game.buildings.some(b=>b.x===x&&b.y===y)){notify('Không thể xây ở đây','Ô đất này đã có công trình.','high');return}
    if(game.stats.money<def.cost){notify('Ngân sách không đủ',`Cần thêm ${money(def.cost-game.stats.money)}.`, 'high');return}
    setGame(prev=>{const next={...prev,buildings:[...prev.buildings,{id:crypto.randomUUID(),type:def.id,x,y,level:1,health:100}],stats:{...prev.stats,money:prev.stats.money-def.cost}};return{...next,stats:calculateStats(next)}})
  }
  const notify=(title:string,body:string,priority:Notification['priority']='low')=>setToast({id:Date.now(),title,body,priority})
  const upgrade=()=>{if(!selectedBuilding||!selectedDef)return;const max=selectedDef.maxLevel??4;if(selectedBuilding.level>=max){notify('Đã đạt cấp tối đa',`${selectedDef.name} đã phát triển hoàn chỉnh.`);return}const cost=Math.round(selectedDef.cost*(.65+selectedBuilding.level*.35));if(game.stats.money<cost){notify('Ngân sách không đủ',`Nâng cấp cần ${money(cost)}.`,'high');return}setGame(prev=>{const next={...prev,buildings:prev.buildings.map(b=>b.id===selectedBuilding.id?{...b,level:b.level+1,health:100}:b),stats:{...prev.stats,money:prev.stats.money-cost}};return{...next,stats:calculateStats(next)}})}
  const triggerDisaster=()=>{if(game.disaster)return;const info=DISASTERS[scenario];setGame(prev=>({...prev,disaster:{kind:scenario,phase:'warning',progress:0,severity:info.severity}}));notify(`CẢNH BÁO: ${info.name.toUpperCase()}`,`${info.warning}. Chuẩn bị: ${info.preparation}.`,'critical')}

  if(!started) return <div className="landing">
    <div className="landing-sun"/><div className="landing-city"><span/><span/><span/><span/><span/></div>
    <main className="hero"><div className="brand"><i>H</i><span>HAVEN<br/><small>CITY</small></span></div><p className="eyebrow">A CO-OP CITY STORY</p><h1>Xây một thành phố<br/><em>đáng để gọi là nhà.</em></h1><p className="lead">Từ khu đất ven sông đến đô thị kiên cường. Mọi con đường, mái nhà và quyết định đều là của bạn.</p>
      <div className="hero-actions"><button className="primary" onClick={()=>{setGame(initialState());setStarted(true)}}>Tạo thành phố mới <b>→</b></button>{hasSave()&&<button className="secondary" onClick={()=>{setGame(loadGame()??initialState());setStarted(true)}}>Tiếp tục thành phố</button>}</div>
      <p className="version">FOUNDATION BUILD · AUTOSAVE ENABLED</p></main>
  </div>

  return <div className={`game weather-${game.weather.replace(' ','-')}`}>
    <header className="topbar"><div className="mini-brand"><i>H</i><span>HAVEN</span></div><div className="city-name"><span>THÀNH PHỐ</span><strong>New Haven</strong></div><div className="metrics">
      <Metric icon="₫" value={money(game.stats.money)} label={`${game.stats.income>=0?'+':''}${money(game.stats.income)}/ngày`} good={game.stats.income>=0}/><Metric icon="♟" value={game.stats.population.toLocaleString('vi-VN')} label="Dân số"/><Metric icon="♥" value={`${game.stats.happiness}%`} label="Hạnh phúc" good={game.stats.happiness>65}/><Metric icon="ϟ" value={`${game.stats.powerUse}/${game.stats.power}`} label="Điện MW" good={game.stats.powerUse<=game.stats.power}/><Metric icon="●" value={`${game.stats.waterUse}/${game.stats.water}`} label="Nước ML" good={game.stats.waterUse<=game.stats.water}/>
    </div><div className="clock"><span>NGÀY {game.day}</span><strong>{String(Math.floor(game.hour)).padStart(2,'0')}:{String(Math.floor((game.hour%1)*60)).padStart(2,'0')}</strong><small>{game.weather}</small></div><div className="speed">{[0,1,2,4].map(s=><button className={speed===s?'active':''} onClick={()=>setSpeed(s)} key={s}>{s===0?'Ⅱ':`${s}×`}</button>)}</div></header>
    <Suspense fallback={<div className="engine-loading"><i/><span>Đang khởi động thế giới 3D</span></div>}><CityCanvas state={game} tool={tool} overlay={overlay} selected={selected} onTile={place} onSelect={setSelected}/></Suspense>
    <div className="level-card"><div className="level-ring">{game.stats.level}</div><div><span>THỊ TRẤN BÌNH YÊN</span><strong>Cấp {game.stats.level}</strong><div className="progress"><i style={{width:`${game.stats.xp/2.5}%`}}/></div><small>{game.stats.xp} / 250 cư dân tới cấp sau</small></div></div>
    <div className="overlay-bar"><span>LỚP THÔNG TIN</span>{(['none','power','water','happiness','flood'] as Overlay[]).map(o=><button key={o} className={overlay===o?'active':''} onClick={()=>setOverlay(o)}>{({none:'◉ Bình thường',power:'ϟ Điện',water:'● Nước',happiness:'♥ Hạnh phúc',flood:'≋ Rủi ro'})[o]}</button>)}<select value={scenario} onChange={event=>setScenario(event.target.value as DisasterKind)}>{Object.entries(DISASTERS).map(([kind,item])=><option key={kind} value={kind}>{item.name}</option>)}</select><button className="disaster-btn" onClick={triggerDisaster}>⚠ Diễn tập</button></div>
    {buildOpen&&<aside className="build-panel"><div className="panel-title"><div><span>QUY HOẠCH</span><h2>Xây dựng</h2></div><button onClick={()=>setBuildOpen(false)}>×</button></div><div className="category-list">{categories.map(c=><button key={c.id} className={category===c.id?'active':''} onClick={()=>setCategory(c.id)}><i>{c.icon}</i>{c.label}</button>)}</div><div className="building-list">{available.map(item=><button key={item.id} className={tool===item.id?'active':''} onClick={()=>setTool(item.id)}><i style={{background:item.color}}>{item.icon}</i><span><strong>{item.name}</strong><small>{money(item.cost)} · −{money(item.upkeep)}/ngày</small></span><b>+</b></button>)}</div></aside>}
    {selectedBuilding&&selectedDef&&<aside className="detail-panel"><button className="close" onClick={()=>setSelected(null)}>×</button><div className="detail-art" style={{'--accent':selectedDef.color} as React.CSSProperties}><i>{selectedDef.icon}</i><span>CẤP {selectedBuilding.level} / {selectedDef.maxLevel??4}</span></div><p className="eyebrow">{categories.find(c=>c.id===selectedDef.category)?.label}</p><h2>{selectedDef.levelNames?.[selectedBuilding.level-1]??selectedDef.name}</h2><p>{selectedDef.description}</p><div className="health"><span>Tình trạng</span><b>{selectedBuilding.health}%</b><i><em style={{width:`${selectedBuilding.health}%`}}/></i></div><div className="detail-grid"><span>Vận hành<b>−{money(Math.round(selectedDef.upkeep*(1+(selectedBuilding.level-1)*.45)))}</b></span><span>Hạnh phúc<b>+{selectedDef.happiness??0}</b></span><span>Điện<b>{selectedDef.power??0} MW</b></span><span>Nước<b>{selectedDef.water??0} ML</b></span></div><button className="upgrade" disabled={selectedBuilding.level>=(selectedDef.maxLevel??4)} onClick={upgrade}>{selectedBuilding.level>=(selectedDef.maxLevel??4)?'Đã đạt cấp tối đa':`Nâng lên cấp ${selectedBuilding.level+1}`}<b>{selectedBuilding.level<(selectedDef.maxLevel??4)&&money(Math.round(selectedDef.cost*(.65+selectedBuilding.level*.35)))}</b></button></aside>}
    <nav className="dock"><button className={buildOpen?'active':''} onClick={()=>{setBuildOpen(!buildOpen);setTool('inspect')}}><i>⌂</i>Xây dựng</button><button onClick={()=>{setBuildOpen(true);setCategory('roads');setTool('road')}}><i>⌁</i>Đường sá</button><button className={tool==='inspect'?'active':''} onClick={()=>setTool('inspect')}><i>↖</i>Khảo sát</button><button className={tool==='bulldoze'?'danger active':''} onClick={()=>setTool('bulldoze')}><i>♜</i>Phá dỡ</button><button onClick={()=>{saveGame(game);notify('Đã lưu thành phố','Tiến độ của bạn đã được lưu an toàn.')}}><i>▣</i>Lưu game</button></nav>
    {game.disaster&&<div className={`disaster ${game.disaster.phase}`}><i>⚠</i><div><span>{game.disaster.phase==='warning'?'CẢNH BÁO SỚM':game.disaster.phase==='active'?'TÌNH TRẠNG KHẨN CẤP':'GIAI ĐOẠN PHỤC HỒI'}</span><strong>{game.disaster.phase==='recovery'?'Thành phố đang phục hồi':game.disaster.phase==='active'?DISASTERS[game.disaster.kind??'flood'].active:DISASTERS[game.disaster.kind??'flood'].warning}</strong></div><em style={{width:`${Math.min(100,game.disaster.progress/(game.disaster.phase==='active'?45:game.disaster.phase==='warning'?30:25)*100)}%`}}/></div>}
    {toast&&<div className={`toast ${toast.priority}`}><i>{toast.priority==='critical'?'⚠':'✦'}</i><div><strong>{toast.title}</strong><span>{toast.body}</span></div><button onClick={()=>setToast(null)}>×</button></div>}
  </div>
}

function Metric({icon,value,label,good}:{icon:string,value:string,label:string,good?:boolean}){return <div className="metric"><i className={good===false?'bad':good?'good':''}>{icon}</i><div><strong>{value}</strong><span>{label}</span></div></div>}
function money(value:number){return `${Math.round(value).toLocaleString('vi-VN')} ₫`}
