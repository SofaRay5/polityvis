import { describe, expect, it } from 'vitest'
import { franceSeed } from '../data/france'
import { loadCountries, loadLocale, normaliseCountry, saveCountries } from './countryStorage'

class MapStorage implements Storage {
  private readonly values = new Map<string, string>()

  constructor(initialValues: Record<string, string> = {}) {
    Object.entries(initialValues).forEach(([key, value]) => this.values.set(key, value))
  }

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('country storage', () => {
  it('normalises a legacy country with left-right positions and editable institutions', () => {
    const legacyFrance = JSON.parse(JSON.stringify(franceSeed)) as Record<string, unknown>
    for (const field of ['presetId', 'systemScores', 'executiveOffices', 'chambers', 'courts', 'territorialLevels']) {
      delete legacyFrance[field]
    }

    const country = normaliseCountry(legacyFrance)

    expect(country).toMatchObject({ presetId: 'semiPresidential' })
    expect(country?.parties[0]).toMatchObject({ ideologyPosition: expect.any(Number) })
    expect(country?.chambers[0].seats).toBe(577)
    expect(country?.parties[0].ideologyPosition).toBe(0)
  })

  it('rejects incomplete expanded saved countries instead of clamping them', () => {
    expect(normaliseCountry({ ...franceSeed, systemScores: { executive: 0 } })).toBeNull()
  })

  it('returns the France seed when no stored collection exists', () => {
    expect(loadCountries(new MapStorage())).toEqual([franceSeed])
  })

  it('ignores malformed saved data instead of throwing', () => {
    const storage = new MapStorage({ 'polityvis:countries:v1': '{bad json' })

    expect(loadCountries(storage)).toEqual([])
  })

  it('rejects schema-invalid saved countries', () => {
    const storage = new MapStorage({
      'polityvis:countries:v1': JSON.stringify([{ id: 'missing-required-fields' }]),
    })

    expect(loadCountries(storage)).toEqual([])
  })

  it('returns valid saved countries without replacing them with the seed', () => {
    const storage = new MapStorage({
      'polityvis:countries:v1': JSON.stringify([franceSeed]),
    })

    expect(loadCountries(storage)).toEqual([franceSeed])
  })

  it('saves countries under the versioned collection key', () => {
    const storage = new MapStorage()

    saveCountries([franceSeed], storage)

    expect(storage.getItem('polityvis:countries:v1')).toBe(JSON.stringify([franceSeed]))
  })

  it('defaults to Chinese when no valid locale is stored', () => {
    expect(loadLocale(new MapStorage())).toBe('zh')
    expect(loadLocale(new MapStorage({ 'polityvis:locale:v1': 'fr' }))).toBe('zh')
  })

  it('reads a supported stored locale', () => {
    expect(loadLocale(new MapStorage({ 'polityvis:locale:v1': 'en' }))).toBe('en')
  })

  it('uses all 577 seats in the France snapshot', () => {
    expect(franceSeed.parties.reduce((total, group) => total + group.seats, 0)).toBe(577)
  })
})
