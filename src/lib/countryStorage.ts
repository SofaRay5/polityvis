import { franceSeed } from '../data/france'
import type { Country, InstitutionRelation, Locale, TranslatedLabel } from '../types/politics'

const countriesKey = 'polityvis:countries:v1'
const localeKey = 'polityvis:locale:v1'

const relationKinds: InstitutionRelation['kind'][] = [
  'elects',
  'appoints',
  'leads',
  'accountableTo',
  'legislates',
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isTranslatedLabel = (value: unknown): value is TranslatedLabel =>
  isRecord(value) && isNonEmptyString(value.zh) && isNonEmptyString(value.en)

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === 'string'

const isCountry = (value: unknown): value is Country => {
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

export const loadCountries = (storage: Storage): Country[] => {
  const storedCountries = storage.getItem(countriesKey)

  if (storedCountries === null) return [franceSeed]

  try {
    const countries: unknown = JSON.parse(storedCountries)
    return Array.isArray(countries) && countries.every(isCountry) ? countries : []
  } catch {
    return []
  }
}

export const saveCountries = (countries: Country[], storage: Storage) => {
  storage.setItem(countriesKey, JSON.stringify(countries))
}

export const loadLocale = (storage: Storage): Locale =>
  storage.getItem(localeKey) === 'en' ? 'en' : 'zh'
