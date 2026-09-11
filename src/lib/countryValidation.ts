import type { CountryDraft, ValidationIssue, ValidationResult } from '../types/politics'

const isExplicitlyEmpty = (value: string | undefined) =>
  value !== undefined && value.trim() === ''

export const validateCountryDraft = (draft: CountryDraft): ValidationResult => {
  const issues: ValidationIssue[] = []
  const lowerHouseSeats = draft.legislature?.lowerHouseSeats

  if (isExplicitlyEmpty(draft.name) || draft.parties?.some((party) => isExplicitlyEmpty(party.name))) {
    issues.push('nameRequired')
  }

  if (
    lowerHouseSeats !== undefined &&
    (!Number.isInteger(lowerHouseSeats) || lowerHouseSeats <= 0)
  ) {
    issues.push('lowerHouseSeatsInvalid')
  }

  if (
    draft.parties?.some(
      (party) => party.seats !== undefined && (!Number.isInteger(party.seats) || party.seats < 0),
    )
  ) {
    issues.push('partySeatsInvalid')
  }

  if (
    lowerHouseSeats !== undefined &&
    Number.isInteger(lowerHouseSeats) &&
    lowerHouseSeats > 0 &&
    draft.parties?.every((party) => party.seats !== undefined)
  ) {
    const totalPartySeats = draft.parties.reduce((total, party) => total + (party.seats ?? 0), 0)

    if (totalPartySeats !== lowerHouseSeats) {
      issues.push('seatTotalMismatch')
    }
  }

  return { issues }
}
