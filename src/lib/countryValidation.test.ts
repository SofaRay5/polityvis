import { describe, expect, it } from 'vitest'
import { validateCountryDraft } from './countryValidation'

describe('validateCountryDraft', () => {
  it('rejects party positions outside the political spectrum', () => {
    expect(
      validateCountryDraft({ parties: [{ name: 'A', seats: 1, ideologyPosition: 101 }] }).issues,
    ).toContain('partyPositionInvalid')
  })

  it('requires expanded drafts to include an office and chamber', () => {
    expect(
      validateCountryDraft({ name: 'Arcadia', executiveOffices: [], chambers: [] }).issues,
    ).toEqual(expect.arrayContaining(['executiveOfficesRequired', 'chambersRequired']))
  })

  it('rejects invalid court and territorial values', () => {
    expect(
      validateCountryDraft({
        courts: [{ id: 'court', label: { zh: '法院', en: 'Court' }, level: -1 }],
        territorialLevels: [{ id: 'province', label: { zh: '省', en: 'Province' }, count: -1, autonomy: 101 }],
      }).issues,
    ).toEqual(expect.arrayContaining(['courtLevelInvalid', 'territorialCountInvalid', 'territorialAutonomyInvalid']))
  })

  it('requires party seats to equal the lower-house total', () => {
    expect(
      validateCountryDraft({
        name: 'Arcadia',
        headOfState: { title: { zh: '国家元首', en: 'Head of state' } },
        headOfGovernment: { title: { zh: '政府首脑', en: 'Head of government' } },
        legislature: { lowerHouseSeats: 10 },
        parties: [{ seats: 9 }],
      }).issues,
    ).toContain('seatTotalMismatch')
  })

  it('accepts a complete legislature distribution', () => {
    expect(
      validateCountryDraft({
        name: 'Arcadia',
        headOfState: { title: { zh: '国家元首', en: 'Head of state' } },
        headOfGovernment: { title: { zh: '政府首脑', en: 'Head of government' } },
        legislature: { lowerHouseSeats: 10 },
        parties: [{ seats: 6 }, { seats: 4 }],
      }).issues,
    ).toEqual([])
  })

  it('rejects an explicitly empty country name', () => {
    expect(
      validateCountryDraft({
        name: '',
        legislature: { lowerHouseSeats: 1 },
        parties: [{ seats: 1 }],
      }).issues,
    ).toContain('nameRequired')
  })

  it('requires a country name', () => {
    expect(validateCountryDraft({}).issues).toContain('nameRequired')
  })

  it('rejects a non-positive lower-house seat count', () => {
    expect(
      validateCountryDraft({ legislature: { lowerHouseSeats: 0 } }).issues,
    ).toContain('lowerHouseSeatsInvalid')
  })

  it('rejects a negative party seat count', () => {
    expect(
      validateCountryDraft({
        legislature: { lowerHouseSeats: 1 },
        parties: [{ seats: -1 }],
      }).issues,
    ).toContain('partySeatsInvalid')
  })

  it('rejects an explicitly empty party name', () => {
    expect(
      validateCountryDraft({
        legislature: { lowerHouseSeats: 1 },
        parties: [{ name: '', seats: 1 }],
      }).issues,
    ).toContain('nameRequired')
  })
})
