import { describe, expect, it } from 'vitest'
import { validateCountryDraft } from './countryValidation'

describe('validateCountryDraft', () => {
  it('requires party seats to equal the lower-house total', () => {
    expect(
      validateCountryDraft({
        legislature: { lowerHouseSeats: 10 },
        parties: [{ seats: 9 }],
      }).issues,
    ).toContain('seatTotalMismatch')
  })

  it('accepts a complete legislature distribution', () => {
    expect(
      validateCountryDraft({
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
