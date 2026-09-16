import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react'
import { messages } from '../i18n/messages'
import { loadCountries, loadLocale, saveCountries } from '../lib/countryStorage'
import type { Country, Locale } from '../types/politics'

export type Screen = 'library' | 'wizard' | 'overview'

export interface AppState {
  countries: Country[]
  activeCountryId: string | null
  screen: Screen
  locale: Locale
}

type AppAction =
  | { type: 'create'; country: Country }
  | { type: 'update'; country: Country }
  | { type: 'edit'; id: string }
  | { type: 'new' }
  | { type: 'duplicate'; id: string; locale: Locale }
  | { type: 'delete'; id: string }
  | { type: 'select'; id: string }
  | { type: 'screen'; screen: Screen }
  | { type: 'locale'; locale: Locale }

// The task's public context module also exposes its reducer for focused tests.
// oxlint-disable-next-line react/only-export-components
export function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'create':
      if (state.countries.some((country) => country.id === action.country.id)) return state
      return { ...state, countries: [...state.countries, action.country], activeCountryId: action.country.id, screen: 'overview' }
    case 'update':
      if (!state.countries.some((country) => country.id === action.country.id)) return state
      return { ...state, countries: state.countries.map((country) => country.id === action.country.id ? action.country : country), activeCountryId: action.country.id, screen: 'overview' }
    case 'edit':
      if (!state.countries.some((country) => country.id === action.id)) return state
      return { ...state, activeCountryId: action.id, screen: 'wizard' }
    case 'new':
      return { ...state, activeCountryId: null, screen: 'wizard' }
    case 'duplicate': {
      const original = state.countries.find((country) => country.id === action.id)
      if (!original) return state
      const copy: Country = {
        ...structuredClone(original),
        id: crypto.randomUUID(),
        name: `${original.name} ${messages[action.locale]['country.copySuffix']}`,
        createdAt: new Date().toISOString(),
      }
      return { ...state, countries: [...state.countries, copy] }
    }
    case 'delete': {
      if (!state.countries.some((country) => country.id === action.id)) return state
      const isActive = state.activeCountryId === action.id
      return {
        ...state,
        countries: state.countries.filter((country) => country.id !== action.id),
        activeCountryId: isActive ? null : state.activeCountryId,
        screen: isActive ? 'library' : state.screen,
      }
    }
    case 'select':
      if (!state.countries.some((country) => country.id === action.id)) return state
      return { ...state, activeCountryId: action.id, screen: 'overview' }
    case 'screen':
      return { ...state, screen: action.screen === 'overview' && !state.activeCountryId ? 'library' : action.screen }
    case 'locale':
      return { ...state, locale: action.locale }
  }
}

interface AppStateValue extends AppState {
  createCountry: (country: Country) => void
  updateCountry: (country: Country) => void
  editCountry: (id: string) => void
  startNewCountry: () => void
  duplicateCountry: (id: string) => void
  deleteCountry: (id: string) => void
  selectCountry: (id: string) => void
  setScreen: (screen: Screen) => void
  setLocale: (locale: Locale) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appStateReducer, undefined, (): AppState => ({
    countries: loadCountries(window.localStorage),
    locale: loadLocale(window.localStorage),
    activeCountryId: null,
    screen: 'library',
  }))

  const persistedCountries = useRef(state.countries)
  useEffect(() => {
    if (state.countries === persistedCountries.current) return
    saveCountries(state.countries, window.localStorage)
    persistedCountries.current = state.countries
  }, [state.countries])

  useEffect(() => {
    window.localStorage.setItem('polityvis:locale:v1', state.locale)
    document.documentElement.lang = state.locale === 'zh' ? 'zh-CN' : 'en'
  }, [state.locale])

  return (
    <AppStateContext.Provider value={{
      ...state,
      createCountry: (country) => dispatch({ type: 'create', country }),
      updateCountry: (country) => dispatch({ type: 'update', country }),
      editCountry: (id) => dispatch({ type: 'edit', id }),
      startNewCountry: () => dispatch({ type: 'new' }),
      duplicateCountry: (id) => dispatch({ type: 'duplicate', id, locale: state.locale }),
      deleteCountry: (id) => dispatch({ type: 'delete', id }),
      selectCountry: (id) => dispatch({ type: 'select', id }),
      setScreen: (screen) => dispatch({ type: 'screen', screen }),
      setLocale: (locale) => dispatch({ type: 'locale', locale }),
    }}>
      {children}
    </AppStateContext.Provider>
  )
}

// Keep the provider and its public consumer hook together.
// oxlint-disable-next-line react/only-export-components
export function useAppState(): AppStateValue {
  const state = useContext(AppStateContext)
  if (!state) throw new Error('useAppState must be used within AppStateProvider')
  return state
}
