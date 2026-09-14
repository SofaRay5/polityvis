import type { CountryDraft, ValidationIssue, ValidationResult } from '../types/politics'

const isExplicitlyEmpty = (value: string | undefined) =>
  value !== undefined && value.trim() === ''

export const validateCountryDraft = (draft: CountryDraft): ValidationResult => {
  const issues: ValidationIssue[] = []
  const partyChambers = draft.chambers?.filter((chamber) => chamber.isPartyChamber) ?? []
  const partyChamberSeats = draft.chambers === undefined
    ? draft.legislature?.lowerHouseSeats
    : partyChambers[0]?.seats

  if (!draft.name?.trim() || draft.parties?.some((party) => isExplicitlyEmpty(party.name))) {
    issues.push('nameRequired')
  }

  if (draft.executiveOffices ? draft.executiveOffices.length === 0 : !draft.headOfState || !draft.headOfGovernment) {
    issues.push('executiveOfficesRequired')
  }

  if (draft.chambers ? draft.chambers.length === 0 : draft.legislature?.lowerHouseSeats === undefined) {
    issues.push('chambersRequired')
  }

  if (draft.chambers && partyChambers.length !== 1) {
    issues.push('partyChamberInvalid')
  }

  if (
    partyChamberSeats !== undefined &&
    (!Number.isInteger(partyChamberSeats) || partyChamberSeats <= 0)
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
    draft.parties?.some(
      (party) => party.ideologyPosition !== undefined &&
        (!Number.isInteger(party.ideologyPosition) || party.ideologyPosition < -100 || party.ideologyPosition > 100),
    )
  ) {
    issues.push('partyPositionInvalid')
  }

  if (draft.courts?.some((court) => !Number.isInteger(court.level) || court.level < 0)) {
    issues.push('courtLevelInvalid')
  }

  if (draft.territorialLevels?.some((level) => !Number.isInteger(level.count) || level.count < 0)) {
    issues.push('territorialCountInvalid')
  }

  if (draft.territorialLevels?.some((level) => !Number.isInteger(level.autonomy) || level.autonomy < 0 || level.autonomy > 100)) {
    issues.push('territorialAutonomyInvalid')
  }

  if (
    partyChamberSeats !== undefined &&
    Number.isInteger(partyChamberSeats) &&
    partyChamberSeats > 0 &&
    (draft.chambers === undefined || partyChambers.length === 1) &&
    draft.parties?.every((party) => party.seats !== undefined)
  ) {
    const totalPartySeats = draft.parties.reduce((total, party) => total + (party.seats ?? 0), 0)

    if (totalPartySeats !== partyChamberSeats) {
      issues.push('seatTotalMismatch')
    }
  }

  return { issues }
}
