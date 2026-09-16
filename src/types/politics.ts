export type Locale = 'zh' | 'en'

export interface TranslatedLabel {
  zh: string
  en: string
}

export interface PoliticalStructure {
  stateForm: string
  governmentForm: string
}

export type SystemAxis = 'executive' | 'participation' | 'centralisation' | 'pluralism' | 'secularism' | 'military'

export type SystemScores = Record<SystemAxis, number>

export type RegimePresetId =
  | 'parliamentaryMonarchy'
  | 'semiPresidential'
  | 'federalPresidential'
  | 'federalDirectDemocracy'
  | 'onePartySocialist'
  | 'absoluteMonarchy'
  | 'militaryCivilian'
  | 'parliamentaryRepublic'
  | 'federalParliamentary'
  | 'directorialRepublic'
  | 'theocraticRepublic'
  | 'dominantPartyRepublic'
  | 'socialistCouncil'
  | 'constitutionalSultanate'
  | 'revolutionaryJunta'

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

export interface ExecutiveOffice {
  id: string
  label: TranslatedLabel
  selectionMethod: string
  terms: number
}

export interface LegislativeChamber {
  id: string
  label: TranslatedLabel
  seats: number
  selectionMethod: string
  isPartyChamber: boolean
}

export interface Court {
  id: string
  label: TranslatedLabel
  level: number
}

export interface TerritorialLevel {
  id: string
  label: TranslatedLabel
  count: number
  autonomy: number
}

export interface PartyGroup {
  id: string
  name: string
  color: string
  seats: number
  ideologyPosition: number
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
  presetId: RegimePresetId
  systemScores: SystemScores
  executiveOffices: ExecutiveOffice[]
  chambers: LegislativeChamber[]
  courts: Court[]
  territorialLevels: TerritorialLevel[]
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
  presetId?: RegimePresetId
  systemScores?: SystemScores
  executiveOffices?: ExecutiveOffice[]
  chambers?: LegislativeChamber[]
  courts?: Court[]
  territorialLevels?: TerritorialLevel[]
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
  | 'partyPositionInvalid'
  | 'executiveOfficesRequired'
  | 'chambersRequired'
  | 'partyChamberInvalid'
  | 'courtLevelInvalid'
  | 'territorialCountInvalid'
  | 'territorialAutonomyInvalid'
  | 'structureInvalid'
  | 'institutionLabelInvalid'
  | 'selectionMethodInvalid'
  | 'officeTermsInvalid'
  | 'chamberSeatsInvalid'
  | 'partyColorInvalid'

export interface ValidationResult {
  issues: ValidationIssue[]
}
