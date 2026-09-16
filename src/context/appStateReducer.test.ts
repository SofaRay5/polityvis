import { describe, expect, it } from 'vitest'
import { franceSeed } from '../data/france'
import { appStateReducer, type AppState } from './AppStateContext'

const initialState: AppState = {
  countries: [franceSeed],
  activeCountryId: null,
  screen: 'library',
  locale: 'zh',
}

describe('appStateReducer', () => {
  it('duplicates a country with a new id and a localized copy suffix', () => {
    const next = appStateReducer(initialState, { type: 'duplicate', id: 'france', locale: 'en' })
    expect(next.countries).toHaveLength(2)
    expect(next.countries[1]).toMatchObject({ name: 'France copy' })
    expect(next.countries[1].id).not.toBe('france')
    expect(next.countries[1].parties).not.toBe(franceSeed.parties)
    expect(next.countries[1].snapshot).toEqual(franceSeed.snapshot)
    expect(initialState.countries).toHaveLength(1)
  })

  it('uses the Chinese copy suffix and supports countries without a snapshot', () => {
    const { snapshot: _snapshot, ...country } = franceSeed
    const next = appStateReducer({ ...initialState, countries: [country] }, { type: 'duplicate', id: 'france', locale: 'zh' })
    expect(next.countries[1].name).toBe('France 副本')
    expect(next.countries[1].snapshot).toBeUndefined()
  })

  it('clears activeCountryId and returns to the library when the active country is deleted', () => {
    const next = appStateReducer({ ...initialState, activeCountryId: 'france', screen: 'overview' }, { type: 'delete', id: 'france' })
    expect(next.activeCountryId).toBeNull()
    expect(next.screen).toBe('library')
    expect(next.countries).toEqual([])
  })

  it('preserves the selected country when another country is deleted', () => {
    const next = appStateReducer({ ...initialState, countries: [franceSeed, { ...franceSeed, id: 'other' }], activeCountryId: 'france', screen: 'overview' }, { type: 'delete', id: 'other' })
    expect(next.countries.map((country) => country.id)).toEqual(['france'])
    expect(next.activeCountryId).toBe('france')
    expect(next.screen).toBe('overview')
  })

  it('opens a saved country in the overview', () => {
    expect(appStateReducer(initialState, { type: 'select', id: 'france' })).toMatchObject({ activeCountryId: 'france', screen: 'overview' })
  })

  it('updates an existing country and returns to its overview', () => {
    const updated = { ...franceSeed, name: 'France updated' }
    const next = appStateReducer({ ...initialState, activeCountryId: 'france', screen: 'wizard' }, { type: 'update', country: updated })
    expect(next.countries[0]).toEqual(updated)
    expect(next).toMatchObject({ activeCountryId: 'france', screen: 'overview' })
  })

  it('adds and opens a newly created country', () => {
    const country = { ...franceSeed, id: 'new-country', name: 'New country' }
    const next = appStateReducer(initialState, { type: 'create', country })
    expect(next.countries).toHaveLength(2)
    expect(next.countries[1]).toEqual(country)
    expect(next).toMatchObject({ activeCountryId: 'new-country', screen: 'overview' })
  })

  it('ignores stale country actions and duplicate creation ids', () => {
    expect(appStateReducer(initialState, { type: 'duplicate', id: 'missing', locale: 'en' })).toBe(initialState)
    expect(appStateReducer(initialState, { type: 'select', id: 'missing' })).toBe(initialState)
    expect(appStateReducer(initialState, { type: 'delete', id: 'missing' })).toBe(initialState)
    expect(appStateReducer(initialState, { type: 'create', country: franceSeed })).toBe(initialState)
  })

  it('changes locale without replacing the saved collection', () => {
    const next = appStateReducer(initialState, { type: 'locale', locale: 'en' })
    expect(next.locale).toBe('en')
    expect(next.countries).toBe(initialState.countries)
  })

  it('allows the wizard screen and guards overview without a selection', () => {
    expect(appStateReducer(initialState, { type: 'screen', screen: 'wizard' }).screen).toBe('wizard')
    expect(appStateReducer(initialState, { type: 'screen', screen: 'overview' }).screen).toBe('library')
  })
})
