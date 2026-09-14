import type { Country, CountryDraft, ExecutiveOffice, Institution, InstitutionRelation, LegislativeChamber, PartyGroup, RegimePresetId, TerritorialLevel, TranslatedLabel } from '../types/politics'
import { validateCountryDraft } from './countryValidation'

const label = (zh: string, en: string): TranslatedLabel => ({ zh, en })

const required = <T>(value: T | undefined, field: string): T => {
  if (value === undefined) throw new Error(`Missing required country field: ${field}`)
  return value
}

const defaultPreset = (governmentForm: string): RegimePresetId =>
  governmentForm === 'parliamentary' ? 'parliamentaryMonarchy' : governmentForm === 'presidential' ? 'federalPresidential' : 'semiPresidential'

const defaultScores = () => ({ executive: 0, participation: 0, centralisation: 0, pluralism: 0, secularism: 0, military: 0 })

export const createCountryFromDraft = (draft: CountryDraft, id: string, createdAt: string): Country => {
  const issues = validateCountryDraft(draft).issues
  if (issues.length > 0) throw new Error(issues.join(', '))

  const name = required(draft.name?.trim() || undefined, 'name')
  const structure = required(draft.structure, 'structure')
  const executiveOffices = draft.executiveOffices ?? [
    { id: 'head-of-state', label: draft.headOfState?.title ?? label('国家元首', 'Head of state'), selectionMethod: draft.headOfState?.selectionMethod ?? 'directElection', terms: 0 },
    { id: 'head-of-government', label: draft.headOfGovernment?.title ?? label('政府首脑', 'Head of government'), selectionMethod: draft.headOfGovernment?.selectionMethod ?? 'appointed', terms: 0 },
  ]
  const chambers = draft.chambers ?? [
    { id: 'lower-house', label: draft.legislature?.lowerHouseLabel ?? label('下议院', 'Lower house'), seats: required(draft.legislature?.lowerHouseSeats, 'lowerHouseSeats'), selectionMethod: 'directElection', isPartyChamber: true },
    ...(draft.legislature?.upperHouseLabel ? [{ id: 'upper-house', label: draft.legislature.upperHouseLabel, seats: 0, selectionMethod: 'indirectElection', isPartyChamber: false }] : []),
  ]
  const primaryOffice = required(executiveOffices[0], 'executiveOffice')
  const partyChamber = required(chambers.find((chamber) => chamber.isPartyChamber), 'partyChamber')
  const territorialLevels: TerritorialLevel[] = draft.territorialLevels ?? [
    { id: 'national', label: label('国家', 'National'), count: 1, autonomy: 0 },
  ]
  const parties = required(draft.parties, 'parties').map((party, index): PartyGroup => ({
    id: `group-${index + 1}`,
    name: required(party.name?.trim() || undefined, 'party name'),
    color: required(party.color, 'party color'),
    seats: required(party.seats, 'party seats'),
    ideologyPosition: party.ideologyPosition ?? 0,
  }))

  const institutions: Institution[] = [
    { id: 'citizens', label: label('公民', 'Citizens') },
    { id: 'head-of-state', label: executiveOffices.find((office) => office.id === 'head-of-state')?.label ?? primaryOffice.label },
    { id: 'head-of-government', label: executiveOffices.find((office) => office.id === 'head-of-government')?.label ?? executiveOffices[1]?.label ?? primaryOffice.label },
    { id: 'government', label: label('政府', 'Government') },
    { id: 'lower-house', label: partyChamber.label },
  ]
  const upperChamber = chambers.find((chamber) => !chamber.isPartyChamber)
  if (upperChamber) institutions.push({ id: 'upper-house', label: upperChamber.label })

  const relations: InstitutionRelation[] = [
    { from: 'head-of-government', to: 'government', kind: 'leads' },
    { from: 'government', to: 'lower-house', kind: 'accountableTo' },
  ]
  const stateSelection = executiveOffices.find((office) => office.id === 'head-of-state')?.selectionMethod ?? primaryOffice.selectionMethod
  const governmentSelection = executiveOffices.find((office) => office.id === 'head-of-government')?.selectionMethod ?? executiveOffices[1]?.selectionMethod
  if (stateSelection === 'directElection' || stateSelection === 'indirectElection') {
    relations.unshift({ from: 'citizens', to: 'head-of-state', kind: 'elects' })
  }
  if (governmentSelection === 'appointed') {
    relations.splice(relations.length - 1, 0, { from: 'head-of-state', to: 'head-of-government', kind: 'appoints' })
  }
  relations.push({ from: 'citizens', to: 'lower-house', kind: 'elects' })

  return {
    id,
    name,
    structure: { stateForm: required(structure.stateForm, 'stateForm'), governmentForm: required(structure.governmentForm, 'governmentForm') },
    headOfState: { title: executiveOffices.find((office) => office.id === 'head-of-state')?.label ?? primaryOffice.label, selectionMethod: stateSelection },
    headOfGovernment: { title: executiveOffices.find((office) => office.id === 'head-of-government')?.label ?? executiveOffices[1]?.label ?? primaryOffice.label, selectionMethod: governmentSelection },
    legislature: { lowerHouseSeats: partyChamber.seats, lowerHouseLabel: partyChamber.label, upperHouseLabel: upperChamber?.label },
    presetId: draft.presetId ?? defaultPreset(required(structure.governmentForm, 'governmentForm')),
    systemScores: draft.systemScores ?? defaultScores(),
    executiveOffices: executiveOffices.map((office): ExecutiveOffice => ({ ...office })),
    chambers: chambers.map((chamber): LegislativeChamber => ({ ...chamber })),
    courts: draft.courts ?? [],
    territorialLevels,
    parties,
    institutions,
    relations,
    createdAt,
  }
}
