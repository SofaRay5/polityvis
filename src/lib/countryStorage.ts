import { franceSeed } from '../data/france'
import { regimePresetList } from '../data/regimePresets'
import { deriveCompatibilityFields } from './countryBuilder'
import type { Country, Court, ExecutiveOffice, InstitutionRelation, LegislativeChamber, Locale, PartyGroup, RegimePresetId, SystemAxis, SystemScores, TerritorialLevel, TranslatedLabel } from '../types/politics'

const countriesKey = 'polityvis:countries:v1'
const localeKey = 'polityvis:locale:v1'

const relationKinds: InstitutionRelation['kind'][] = [
  'elects',
  'appoints',
  'leads',
  'accountableTo',
  'legislates',
]

const systemAxes: SystemAxis[] = ['executive', 'participation', 'centralisation', 'pluralism', 'secularism', 'military']
const presetIds: RegimePresetId[] = regimePresetList.map((preset) => preset.id)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isTranslatedLabel = (value: unknown): value is TranslatedLabel =>
  isRecord(value) && isNonEmptyString(value.zh) && isNonEmptyString(value.en)

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === 'string'

type LegacyCountry = Omit<Country, 'presetId' | 'systemScores' | 'executiveOffices' | 'chambers' | 'courts' | 'territorialLevels' | 'parties'> & {
  parties: Array<Omit<PartyGroup, 'ideologyPosition'>>
}

const isNonNegativeInteger = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) >= 0

const isLegacyCountry = (value: unknown): value is LegacyCountry => {
  if (!isRecord(value)) return false

  const hasValidSnapshot =
    value.snapshot === undefined ||
    (isRecord(value.snapshot) &&
      isNonEmptyString(value.snapshot.date) &&
      Array.isArray(value.snapshot.sources) &&
      value.snapshot.sources.every(isNonEmptyString))

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isRecord(value.structure) &&
    isNonEmptyString(value.structure.stateForm) &&
    isNonEmptyString(value.structure.governmentForm) &&
    isRecord(value.headOfState) &&
    isTranslatedLabel(value.headOfState.title) &&
    isOptionalString(value.headOfState.officeholder) &&
    isOptionalString(value.headOfState.selectionMethod) &&
    isRecord(value.headOfGovernment) &&
    isTranslatedLabel(value.headOfGovernment.title) &&
    isOptionalString(value.headOfGovernment.officeholder) &&
    isOptionalString(value.headOfGovernment.selectionMethod) &&
    isRecord(value.legislature) &&
    Number.isInteger(value.legislature.lowerHouseSeats) &&
    (value.legislature.lowerHouseSeats as number) > 0 &&
    (value.legislature.lowerHouseLabel === undefined || isTranslatedLabel(value.legislature.lowerHouseLabel)) &&
    (value.legislature.upperHouseLabel === undefined || isTranslatedLabel(value.legislature.upperHouseLabel)) &&
    Array.isArray(value.parties) &&
    value.parties.every(
      (party) =>
        isRecord(party) &&
        isNonEmptyString(party.id) &&
        isNonEmptyString(party.name) &&
        isNonEmptyString(party.color) &&
        Number.isInteger(party.seats) &&
        (party.seats as number) >= 0,
    ) &&
    Array.isArray(value.institutions) &&
    value.institutions.every(
      (institution) =>
        isRecord(institution) && isNonEmptyString(institution.id) && isTranslatedLabel(institution.label),
    ) &&
    Array.isArray(value.relations) &&
    value.relations.every(
      (relation) =>
        isRecord(relation) &&
        isNonEmptyString(relation.from) &&
        isNonEmptyString(relation.to) &&
        typeof relation.kind === 'string' &&
        relationKinds.includes(relation.kind as InstitutionRelation['kind']),
    ) &&
    hasValidSnapshot &&
    isNonEmptyString(value.createdAt)
  )
}

const isSystemScores = (value: unknown): value is SystemScores =>
  isRecord(value) && systemAxes.every((axis) => Number.isInteger(value[axis]) && (value[axis] as number) >= -100 && (value[axis] as number) <= 100)

const isExecutiveOffice = (value: unknown): value is ExecutiveOffice =>
  isRecord(value) &&
  isNonEmptyString(value.id) &&
  isTranslatedLabel(value.label) &&
  isNonEmptyString(value.selectionMethod) &&
  isNonNegativeInteger(value.terms)

const isChamber = (value: unknown): value is LegislativeChamber =>
  isRecord(value) &&
  isNonEmptyString(value.id) &&
  isTranslatedLabel(value.label) &&
  isNonNegativeInteger(value.seats) &&
  isNonEmptyString(value.selectionMethod) &&
  typeof value.isPartyChamber === 'boolean'

const isCourt = (value: unknown): value is Court =>
  isRecord(value) && isNonEmptyString(value.id) && isTranslatedLabel(value.label) && isNonNegativeInteger(value.level)

const isTerritorialLevel = (value: unknown): value is TerritorialLevel =>
  isRecord(value) &&
  isNonEmptyString(value.id) &&
  isTranslatedLabel(value.label) &&
  isNonNegativeInteger(value.count) &&
  Number.isInteger(value.autonomy) &&
  (value.autonomy as number) >= 0 &&
  (value.autonomy as number) <= 100

const sameLabel = (left: TranslatedLabel | undefined, right: TranslatedLabel | undefined) =>
  left === right || (left !== undefined && right !== undefined && left.zh === right.zh && left.en === right.en)

const hasDerivedCompatibilityFields = (country: LegacyCountry, offices: ExecutiveOffice[], chambers: LegislativeChamber[]) => {
  const { headOfState, headOfGovernment, legislature } = deriveCompatibilityFields(offices, chambers)

  return sameLabel(country.headOfState.title, headOfState.title) &&
    country.headOfState.selectionMethod === headOfState.selectionMethod &&
    sameLabel(country.headOfGovernment.title, headOfGovernment.title) &&
    country.headOfGovernment.selectionMethod === headOfGovernment.selectionMethod &&
    country.legislature.lowerHouseSeats === legislature.lowerHouseSeats &&
    sameLabel(country.legislature.lowerHouseLabel, legislature.lowerHouseLabel) &&
    sameLabel(country.legislature.upperHouseLabel, legislature.upperHouseLabel)
}

const isExpandedCountry = (value: LegacyCountry): value is Country => {
  const expanded = value as LegacyCountry & Record<string, unknown>
  if (
    !presetIds.includes(expanded.presetId as RegimePresetId) ||
    !isSystemScores(expanded.systemScores) ||
    !Array.isArray(expanded.executiveOffices) ||
    expanded.executiveOffices.length === 0 ||
    !expanded.executiveOffices.every(isExecutiveOffice) ||
    !Array.isArray(expanded.chambers) ||
    expanded.chambers.length === 0 ||
    !expanded.chambers.every(isChamber) ||
    !Array.isArray(expanded.courts) ||
    !expanded.courts.every(isCourt) ||
    !Array.isArray(expanded.territorialLevels) ||
    !expanded.territorialLevels.every(isTerritorialLevel) ||
    !value.parties.every((party) => Number.isInteger((party as PartyGroup).ideologyPosition) && (party as PartyGroup).ideologyPosition >= -100 && (party as PartyGroup).ideologyPosition <= 100)
  ) return false

  const offices = expanded.executiveOffices as ExecutiveOffice[]
  const chambers = expanded.chambers as LegislativeChamber[]
  const partyChambers = chambers.filter((chamber) => chamber.isPartyChamber)
  return partyChambers.length === 1 &&
    value.parties.reduce((total, party) => total + party.seats, 0) === partyChambers[0].seats &&
    hasDerivedCompatibilityFields(value, offices, chambers)
}

const defaultPreset = (country: LegacyCountry): RegimePresetId =>
  country.id === 'france'
    ? 'semiPresidential'
    : country.structure.governmentForm === 'parliamentary'
      ? 'parliamentaryMonarchy'
      : country.structure.governmentForm === 'presidential'
        ? 'federalPresidential'
        : 'semiPresidential'

const defaultScores = (): SystemScores => ({ executive: 0, participation: 0, centralisation: 0, pluralism: 0, secularism: 0, military: 0 })

export const normaliseCountry = (value: unknown): Country | null => {
  if (!isLegacyCountry(value)) return null

  const hasExpandedFields = ['presetId', 'systemScores', 'executiveOffices', 'chambers', 'courts', 'territorialLevels'].some((field) => field in value)
  if (hasExpandedFields) return isExpandedCountry(value) ? value : null

  const lowerHouseLabel = value.legislature.lowerHouseLabel ?? { zh: '下议院', en: 'Lower house' }
  const france = value.id === 'france' ? franceSeed : undefined
  const executiveOffices = [
    { id: 'head-of-state', label: value.headOfState.title, selectionMethod: value.headOfState.selectionMethod ?? 'directElection', terms: france?.executiveOffices[0].terms ?? 0 },
    { id: 'head-of-government', label: value.headOfGovernment.title, selectionMethod: value.headOfGovernment.selectionMethod ?? 'appointed', terms: 0 },
  ]
  const chambers = [
    { id: 'lower-house', label: lowerHouseLabel, seats: value.legislature.lowerHouseSeats, selectionMethod: france?.chambers[0].selectionMethod ?? 'directElection', isPartyChamber: true },
    ...(value.legislature.upperHouseLabel ? [{ id: 'upper-house', label: value.legislature.upperHouseLabel, seats: france?.chambers[1].seats ?? 0, selectionMethod: france?.chambers[1].selectionMethod ?? 'indirectElection', isPartyChamber: false }] : []),
  ]
  const compatibility = deriveCompatibilityFields(executiveOffices, chambers)
  const country = {
    ...value,
    ...compatibility,
    headOfState: { ...value.headOfState, ...compatibility.headOfState },
    headOfGovernment: { ...value.headOfGovernment, ...compatibility.headOfGovernment },
    presetId: defaultPreset(value),
    systemScores: france?.systemScores ?? defaultScores(),
    executiveOffices,
    chambers,
    courts: [],
    territorialLevels: france?.territorialLevels ?? [{ id: 'national', label: { zh: '国家', en: 'National' }, count: 1, autonomy: 0 }],
    parties: value.parties.map((party) => ({ ...party, ideologyPosition: (party as Partial<PartyGroup>).ideologyPosition ?? france?.parties.find((seed) => seed.id === party.id)?.ideologyPosition ?? 0 })),
  }
  return isExpandedCountry(country) ? country : null
}

export const loadCountries = (storage: Storage): Country[] => {
  const storedCountries = storage.getItem(countriesKey)

  if (storedCountries === null) return [franceSeed]

  try {
    const countries: unknown = JSON.parse(storedCountries)
    if (!Array.isArray(countries)) return []
    const normalisedCountries = countries.map(normaliseCountry)
    return normalisedCountries.every((country): country is Country => country !== null) ? normalisedCountries : []
  } catch {
    return []
  }
}

export const saveCountries = (countries: Country[], storage: Storage) => {
  const existing = storage.getItem(countriesKey)
  if (existing !== null) {
    let readable = false
    try {
      const parsed: unknown = JSON.parse(existing)
      readable = Array.isArray(parsed) && parsed.every((country) => normaliseCountry(country) !== null)
    } catch { /* Preserve the original payload before replacing malformed JSON. */ }
    if (!readable) storage.setItem(`${countriesKey}:recovery`, existing)
  }
  storage.setItem(countriesKey, JSON.stringify(countries))
}

export const loadLocale = (storage: Storage): Locale =>
  storage.getItem(localeKey) === 'en' ? 'en' : 'zh'
