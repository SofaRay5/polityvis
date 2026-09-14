import { describe, expect, it } from 'vitest'
import { createCountryFromDraft } from './countryBuilder'

describe('createCountryFromDraft', () => {
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
  })
})
