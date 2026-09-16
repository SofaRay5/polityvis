import type { Country, Locale, PartyGroup } from '../types/politics'

const francePartyNames: Record<string, string> = {
  rn: '国民联盟',
  epr: '为了共和国',
  'lfi-nfp': '不屈法国—新人民阵线',
  socialistes: '社会党及相关人士',
  dr: '共和右翼',
  ecologiste: '生态主义者和社会党',
  dem: '民主党',
  horizons: '地平线与独立人士',
  liot: '自由、独立、海外和领土',
  gdr: '民主和共和左翼',
  udr: '共和右翼联盟',
  'non-inscrits': '无党籍议员',
}

const franceStructureLabels = {
  stateForm: '单一制国家',
  governmentForm: '半总统制共和国',
} as const

const isFrance = (country: Country) => country.id === 'france'

export const countryName = (country: Country, locale: Locale) => isFrance(country) && locale === 'zh' ? '法国' : country.name

export const countryStructureLabel = (country: Country, field: keyof typeof franceStructureLabels, locale: Locale) =>
  isFrance(country) && locale === 'zh' ? franceStructureLabels[field] : country.structure[field]

export const countryPartyName = (country: Country, party: PartyGroup, locale: Locale) =>
  isFrance(country) && locale === 'zh' ? francePartyNames[party.id] ?? party.name : party.name
