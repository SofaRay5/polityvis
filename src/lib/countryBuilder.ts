import type { Country, CountryDraft, Institution, InstitutionRelation, PartyGroup, TranslatedLabel } from '../types/politics'

const label = (zh: string, en: string): TranslatedLabel => ({ zh, en })

const required = <T>(value: T | undefined, field: string): T => {
  if (value === undefined) throw new Error(`Missing required country field: ${field}`)
  return value
}

export const createCountryFromDraft = (draft: CountryDraft, id: string, createdAt: string): Country => {
  const name = required(draft.name?.trim() || undefined, 'name')
  const structure = required(draft.structure, 'structure')
  const headOfState = required(draft.headOfState, 'headOfState')
  const headOfGovernment = required(draft.headOfGovernment, 'headOfGovernment')
  const legislature = required(draft.legislature, 'legislature')
  const lowerHouseSeats = required(legislature.lowerHouseSeats, 'lowerHouseSeats')
  const parties = required(draft.parties, 'parties').map((party, index): PartyGroup => ({
    id: `group-${index + 1}`,
    name: required(party.name?.trim() || undefined, 'party name'),
    color: required(party.color, 'party color'),
    seats: required(party.seats, 'party seats'),
  }))

  const institutions: Institution[] = [
    { id: 'citizens', label: label('公民', 'Citizens') },
    { id: 'head-of-state', label: headOfState.title ?? label('国家元首', 'Head of state') },
    { id: 'head-of-government', label: headOfGovernment.title ?? label('政府首脑', 'Head of government') },
    { id: 'government', label: label('政府', 'Government') },
    { id: 'lower-house', label: legislature.lowerHouseLabel ?? label('下议院', 'Lower house') },
  ]
  if (legislature.upperHouseLabel) institutions.push({ id: 'upper-house', label: legislature.upperHouseLabel })

  const relations: InstitutionRelation[] = [
    { from: 'head-of-government', to: 'government', kind: 'leads' },
    { from: 'government', to: 'lower-house', kind: 'accountableTo' },
  ]
  if (headOfState.selectionMethod === 'directElection' || headOfState.selectionMethod === 'indirectElection') {
    relations.unshift({ from: 'citizens', to: 'head-of-state', kind: 'elects' })
  }
  if (headOfGovernment.selectionMethod === 'appointed') {
    relations.splice(relations.length - 1, 0, { from: 'head-of-state', to: 'head-of-government', kind: 'appoints' })
  }
  relations.push({ from: 'citizens', to: 'lower-house', kind: 'elects' })

  return {
    id,
    name,
    structure: { stateForm: required(structure.stateForm, 'stateForm'), governmentForm: required(structure.governmentForm, 'governmentForm') },
    headOfState: { title: headOfState.title ?? label('国家元首', 'Head of state'), selectionMethod: headOfState.selectionMethod },
    headOfGovernment: { title: headOfGovernment.title ?? label('政府首脑', 'Head of government'), selectionMethod: headOfGovernment.selectionMethod },
    legislature: { lowerHouseSeats, lowerHouseLabel: legislature.lowerHouseLabel, upperHouseLabel: legislature.upperHouseLabel },
    parties,
    institutions,
    relations,
    createdAt,
  }
}
