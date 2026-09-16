import { describe, expect, it } from 'vitest'
import { createCountryFromDraft } from './countryBuilder'
import { regimePresets, regimePresetList } from '../data/regimePresets'
import { normaliseCountry } from './countryStorage'

describe('createCountryFromDraft', () => {
  it.each(regimePresetList)('round-trips the $id preset', (preset) => {
    const country = createCountryFromDraft(preset.default, preset.id, '2026-09-16')
    expect(normaliseCountry(JSON.parse(JSON.stringify(country)))).toEqual(country)
  })

  it.each(['parliamentaryMonarchy', 'absoluteMonarchy'] as const)('does not elect the monarch in %s', (id) => {
    const country = createCountryFromDraft(regimePresets[id].default, id, '2026-09-16')
    expect(country.headOfState.selectionMethod).toBe('hereditary')
    expect(country.relations).not.toContainEqual({ from: 'citizens', to: 'head-of-state', kind: 'elects' })
  })

  it('uses one presidential office with no president-appointing-president edge', () => {
    const country = createCountryFromDraft(regimePresets.federalPresidential.default, 'us', '2026-09-16')
    expect(country.executiveOffices).toHaveLength(1)
    expect(country.relations).not.toContainEqual({ from: 'head-of-state', to: 'head-of-government', kind: 'appoints' })
    expect(country.relations).toContainEqual({ from: 'head-of-state', to: 'government', kind: 'leads' })
    expect(country.relations).not.toContainEqual({ from: 'government', to: 'lower-house', kind: 'accountableTo' })
  })

  it.each(['appointed', 'hereditary', 'militaryAppointment'])('does not show citizen election for a %s chamber', (selectionMethod) => {
    const draft = structuredClone(regimePresets.semiPresidential.default)
    draft.chambers![0].selectionMethod = selectionMethod
    const country = createCountryFromDraft(draft, 'custom', '2026-09-16')
    expect(country.relations).not.toContainEqual({ from: 'citizens', to: 'lower-house', kind: 'elects' })
  })

  it('derives parliamentary executive selection and chamber accountability from the chosen method', () => {
    const draft = structuredClone(regimePresets.federalDirectDemocracy.default)
    const country = createCountryFromDraft(draft, 'swiss', '2026-09-16')
    expect(country.headOfGovernment.selectionMethod).toBe('parliamentaryElection')
    expect(country.relations).toContainEqual({ from: 'lower-house', to: 'head-of-government', kind: 'elects' })
    expect(country.relations).not.toContainEqual({ from: 'head-of-state', to: 'head-of-government', kind: 'appoints' })
  })
  it('rejects a draft whose party seats do not fill its party chamber', () => {
    expect(() => createCountryFromDraft({
      name: 'Arcadia',
      structure: { stateForm: 'unitary', governmentForm: 'semiPresidential' },
      headOfState: { selectionMethod: 'directElection' },
      headOfGovernment: { selectionMethod: 'appointed' },
      legislature: { lowerHouseSeats: 10 },
      parties: [{ name: 'Civic Alliance', color: '#2879ff', seats: 9 }],
    }, 'country-1', '2026-09-14T00:00:00.000Z')).toThrow('seatTotalMismatch')
  })

  it('creates elected executive and legislative institutions with accountability', () => {
    const country = createCountryFromDraft({
      name: 'Arcadia',
      structure: { stateForm: 'unitary', governmentForm: 'semiPresidential' },
      headOfState: { selectionMethod: 'directElection' },
      headOfGovernment: { selectionMethod: 'appointed' },
      legislature: { lowerHouseSeats: 10, lowerHouseLabel: { zh: '国民议会', en: 'National Assembly' } },
      parties: [
        { name: 'Civic Alliance', color: '#2879ff', seats: 6 },
        { name: 'Green Forum', color: '#36bf86', seats: 4 },
      ],
    }, 'country-1', '2026-09-14T00:00:00.000Z')

    expect(country.parties.map((party) => party.seats)).toEqual([6, 4])
    expect(country.relations).toEqual(expect.arrayContaining([
      { from: 'citizens', to: 'head-of-state', kind: 'elects' },
      { from: 'head-of-state', to: 'head-of-government', kind: 'appoints' },
      { from: 'head-of-government', to: 'government', kind: 'leads' },
      { from: 'government', to: 'lower-house', kind: 'accountableTo' },
    ]))
    expect(country.executiveOffices).toHaveLength(2)
    expect(country.chambers).toMatchObject([{ id: 'lower-house', seats: 10, isPartyChamber: true }])
    expect(country.parties.map((party) => party.ideologyPosition)).toEqual([0, 0])
  })

  it('keeps custom offices, chambers, courts, and territorial levels', () => {
    const country = createCountryFromDraft({
      name: 'Customia',
      structure: { stateForm: 'federal republic', governmentForm: 'custom' },
      executiveOffices: [
        { id: 'president', label: { zh: '总统', en: 'President' }, selectionMethod: 'directElection', terms: 4 },
        { id: 'minister', label: { zh: '总理', en: 'Prime Minister' }, selectionMethod: 'appointed', terms: 4 },
      ],
      chambers: [
        { id: 'assembly', label: { zh: '议会', en: 'Assembly' }, seats: 10, selectionMethod: 'election', isPartyChamber: true },
        { id: 'senate', label: { zh: '参议院', en: 'Senate' }, seats: 4, selectionMethod: 'appointment', isPartyChamber: false },
      ],
      courts: [
        { id: 'constitutional', label: { zh: '宪法法院', en: 'Constitutional Court' }, level: 0 },
        { id: 'appeal', label: { zh: '上诉法院', en: 'Court of Appeal' }, level: 1 },
      ],
      territorialLevels: [
        { id: 'regions', label: { zh: '地区', en: 'Regions' }, count: 12, autonomy: 70 },
      ],
      parties: [
        { name: 'Civic Alliance', color: '#2879ff', seats: 6, ideologyPosition: -50 },
        { name: 'Green Forum', color: '#36bf86', seats: 4, ideologyPosition: 50 },
      ],
    }, 'country-1', '2026-09-14T00:00:00.000Z')

    expect(country.executiveOffices).toHaveLength(2)
    expect(country.chambers).toHaveLength(2)
    expect(country.courts).toHaveLength(2)
    expect(country.territorialLevels[0].autonomy).toBe(70)
  })

  it('blocks creation for invalid editable persistence fields', () => {
    expect(() => createCountryFromDraft({
      name: 'Arcadia',
      structure: { stateForm: '', governmentForm: 'parliamentary' },
      executiveOffices: [{ id: 'executive', label: { zh: '行政', en: '' }, selectionMethod: 'appointed', terms: 1.5 }],
      chambers: [{ id: 'assembly', label: { zh: '议会', en: 'Assembly' }, seats: 1, selectionMethod: 'election', isPartyChamber: true }],
      parties: [{ name: 'Civic', color: '#2879ff', seats: 1, ideologyPosition: 0 }],
    }, 'country-1', '2026-09-14T00:00:00.000Z')).toThrow('structureInvalid')
  })
})
