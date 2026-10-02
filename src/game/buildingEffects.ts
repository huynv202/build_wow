import { serviceReach } from './services'
import type { BuildingDefinition } from '../types'

export type EffectTone = 'growth' | 'service' | 'utility' | 'protection' | 'demand'

export interface BuildingEffectBadge {
  icon: string
  label: string
  tone: EffectTone
}

const civicEffects: Record<string, (level: number) => BuildingEffectBadge[]> = {
  road: () => [
    effect('⌁', 'Kết nối ô xây dựng', 'service'),
    effect('↔', 'Tăng năng lực lưu thông', 'service'),
  ],
  park: level => [effect('≋', `Chống ngập +${4 * level}`, 'protection')],
  substation: level => [effect('ϟ', `Chống mất điện +${22 * level}`, 'protection')],
  clinic: level => [effect('✚', `Y tế +${9 * level}`, 'service'), coverage('clinic', level)],
  hospital: level => [effect('✚', `Y tế +${14 * level}`, 'service'), coverage('hospital', level)],
  school: level => [effect('◇', `Giáo dục +${9 * level}`, 'service'), coverage('school', level)],
  university: level => [effect('◇', `Giáo dục +${15 * level}`, 'service'), coverage('university', level)],
  fire: level => [effect('△', `An toàn +${8 * level}`, 'service'), coverage('fire', level)],
  police: level => [effect('★', `An ninh +${9 * level}`, 'service'), coverage('police', level)],
  security_hub: level => [effect('⌾', `Phòng vệ +${14 * level}`, 'protection'), effect('⛨', `Chặn zombie trong ${radius('security_hub', level)} ô`, 'protection')],
  research_lab: level => [effect('⌬', `Phòng vệ +${6 * level}`, 'protection'), effect('✚', `Chống dịch trong ${radius('research_lab', level)} ô`, 'protection')],
  defense_tower: level => [effect('⟁', `Phòng vệ +${18 * level}`, 'protection'), effect('⛨', `Chặn quái thú trong ${radius('defense_tower', level)} ô`, 'protection')],
  drain: level => [effect('≋', `Giảm ngập trong ${radius('drain', level)} ô`, 'protection')],
  uv_station: level => [effect('☂', `Chắn UV trong ${radius('uv_station', level)} ô`, 'protection')],
  seawall: level => [effect('≈', `Chắn sóng trong ${radius('seawall', level)} ô`, 'protection')],
  shelter: level => [effect('⬟', `Trú ẩn trong ${radius('shelter', level)} ô`, 'protection')],
  logging_camp: level => [effect('♠', `Gỗ tròn +${Math.round(10 * (1 + (level - 1) * .45))}/ngày`, 'growth')],
  farm: level => [effect('◒', `Lương thực +${Math.round(11 * (1 + (level - 1) * .45))}/ngày`, 'growth')],
  fishing_dock: level => [effect('≋', `Cá +${Math.round(9 * (1 + (level - 1) * .45))}/ngày`, 'growth')],
  seafood_factory: level => [effect('◈', `Hải sản +${Math.round(4 * (1 + (level - 1) * .45))}/ngày`, 'growth'), effect('◆', 'Tăng giá trị cá đánh bắt', 'service')],
  sawmill: level => [effect('▧', `Ván gỗ +${Math.round(5 * (1 + (level - 1) * .45))}/ngày`, 'growth')],
  quarry: level => [effect('◆', `Quặng +${Math.round(8 * (1 + (level - 1) * .45))}/ngày`, 'growth')],
  workshop: level => [effect('⚙', `Công cụ +${Math.round(3 * (1 + (level - 1) * .45))}/ngày`, 'growth')],
  warehouse: level => [effect('▤', `Kho +${Math.round(120 * (1 + (level - 1) * .45))}`, 'utility')],
}

/** Converts the real simulation fields into concise, player-facing effects. */
export function buildingEffectBadges(definition: BuildingDefinition, level = 1): BuildingEffectBadge[] {
  const scale = 1 + (level - 1) * .45
  const badges = [...(civicEffects[definition.id]?.(level) ?? [])]

  if ((definition.category === 'transport' || definition.category === 'landmarks') && definition.mobility) badges.push(effect('↔', `Di chuyển +${definition.mobility * level}`, 'service'))
  if (definition.population) badges.push(effect('♟', `+${scaled(definition.population, scale)} chỗ ở`, 'growth'))
  if (definition.jobs) badges.push(effect('▣', `+${scaled(definition.jobs, scale)} việc làm`, 'growth'))
  if (definition.power) badges.push(definition.power > 0
    ? effect('ϟ', `+${scaled(definition.power, scale)} MW điện`, 'utility')
    : effect('ϟ', `Dùng ${scaled(-definition.power, scale)} MW`, 'demand'))
  if (definition.water) badges.push(definition.water > 0
    ? effect('●', `+${scaled(definition.water, scale)} ML nước`, 'utility')
    : effect('●', `Dùng ${scaled(-definition.water, scale)} ML`, 'demand'))
  if (definition.happiness) badges.push(effect('♥', `Hạnh phúc +${scaled(definition.happiness, scale)}`, 'growth'))
  if (definition.category !== 'transport' && definition.category !== 'landmarks' && definition.mobility) badges.push(effect('↔', `Di chuyển +${definition.mobility * level}`, 'service'))
  if (definition.gridStability) badges.push(effect('ϟ', `Ổn định lưới +${definition.gridStability * level}`, 'utility'))
  if (definition.resilience) badges.push(effect('⛨', `Chống chịu +${definition.resilience * level}`, 'protection'))

  return badges
}

function radius(type: string, level: number) {
  return format(serviceReach(type, level))
}

function coverage(type: string, level: number) {
  return effect('◎', `Phủ ${radius(type, level)} ô`, 'service')
}

function scaled(value: number, scale: number) {
  return Math.round(value * scale)
}

function format(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function effect(icon: string, label: string, tone: EffectTone): BuildingEffectBadge {
  return { icon, label, tone }
}
