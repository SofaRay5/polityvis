import { describe, expect, it } from 'vitest'
import { franceSeed } from '../data/france'
import { countryName, countryPartyName, countryStructureLabel } from './countryDisplay'

describe('country display localization', () => {
  it('localizes France-specific names and institutional labels in Chinese', () => {
    expect(countryName(franceSeed, 'zh')).toBe('法国')
    expect(countryStructureLabel(franceSeed, 'stateForm', 'zh')).toBe('单一制国家')
    expect(countryStructureLabel(franceSeed, 'governmentForm', 'zh')).toBe('半总统制共和国')
    expect(countryPartyName(franceSeed, franceSeed.parties[0], 'zh')).toBe('国民联盟')
  })

  it('keeps the existing English labels for France', () => {
    expect(countryName(franceSeed, 'en')).toBe('France')
    expect(countryPartyName(franceSeed, franceSeed.parties[0], 'en')).toBe('Rassemblement National')
  })
})
