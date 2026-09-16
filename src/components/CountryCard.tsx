import { useAppState } from '../context/AppStateContext'
import { messages } from '../i18n/messages'
import type { Country } from '../types/politics'
import { countryName, countryStructureLabel } from '../lib/countryDisplay'

export function CountryCard({ country }: { country: Country }) {
  const { locale, selectCountry, duplicateCountry, deleteCountry } = useAppState()
  const t = messages[locale]

  function confirmDelete() {
    if (window.confirm(`${countryName(country, locale)}\n\n${t['country.deleteConfirm']}`)) deleteCountry(country.id)
  }

  return (
    <article className="country-card" aria-labelledby={`country-${country.id}`}>
      <div className="country-card-content">
        <div className="country-card-mark" aria-hidden="true">{countryName(country, locale).slice(0, 2).toLocaleUpperCase(locale)}</div>
        <h2 id={`country-${country.id}`}>{countryName(country, locale)}</h2>
        <p className="country-government">{countryStructureLabel(country, 'governmentForm', locale)}</p>
        <p className="country-state-form">{countryStructureLabel(country, 'stateForm', locale)}</p>
        <dl className="country-details">
          <div><dt>{t['overview.legislature']}</dt><dd>{country.legislature.lowerHouseLabel?.[locale] ?? t['wizard.lowerHouse']}</dd></div>
          <div><dt>{t['overview.totalSeats']}</dt><dd>{country.legislature.lowerHouseSeats.toLocaleString(locale)}</dd></div>
        </dl>
      </div>
      <div className="country-card-actions">
        <button type="button" className="button-open" onClick={() => selectCountry(country.id)}>{t['country.open']} <span aria-hidden="true">↗</span></button>
        <button type="button" className="button-subtle" onClick={() => duplicateCountry(country.id)}>{t['country.duplicate']}</button>
        <button type="button" className="button-delete" onClick={confirmDelete}>{t['country.delete']}</button>
      </div>
    </article>
  )
}
