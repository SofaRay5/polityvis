import type { Country } from '../types/politics'
import { CountryDashboard } from './CountryDashboard'

export function CountryOverview({ country, locale }: { country: Country; locale: 'zh' | 'en' }) {
  return <CountryDashboard country={country} locale={locale} />
}
