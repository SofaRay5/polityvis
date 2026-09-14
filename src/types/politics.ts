export type Locale = 'zh' | 'en'

export interface TranslatedLabel {
  zh: string
  en: string
}

export interface PoliticalStructure {
  stateForm: string
  governmentForm: string
}

export interface ExecutiveRole {
  title: TranslatedLabel
  officeholder?: string
  selectionMethod?: string
}

export interface Legislature {
  lowerHouseSeats: number
  lowerHouseLabel?: TranslatedLabel
  upperHouseLabel?: TranslatedLabel
}

export interface PartyGroup {
  id: string
  name: string
  color: string
  seats: number
}

export interface Institution {
  id: string
  label: TranslatedLabel
}

export interface InstitutionRelation {
  from: string
  to: string
  kind: 'elects' | 'appoints' | 'leads' | 'accountableTo' | 'legislates'
}

export interface Snapshot {
  date: string
  sources: string[]
}

export interface Country {
  id: string
  name: string
  structure: PoliticalStructure
  headOfState: ExecutiveRole
  headOfGovernment: ExecutiveRole
  legislature: Legislature
  parties: PartyGroup[]
  institutions: Institution[]
  relations: InstitutionRelation[]
  snapshot?: Snapshot
  createdAt: string
}

export interface CountryDraft {
  name?: string
  structure?: Partial<PoliticalStructure>
  headOfState?: Partial<ExecutiveRole>
  headOfGovernment?: Partial<ExecutiveRole>
  legislature?: Partial<Legislature>
  parties?: Array<Partial<PartyGroup>>
  institutions?: Institution[]
  relations?: InstitutionRelation[]
  snapshot?: Snapshot
}

export type ValidationIssue =
  | 'nameRequired'
  | 'lowerHouseSeatsInvalid'
  | 'partySeatsInvalid'
  | 'seatTotalMismatch'

export interface ValidationResult {
  issues: ValidationIssue[]
}
