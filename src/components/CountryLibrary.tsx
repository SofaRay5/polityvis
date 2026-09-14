import { useAppState } from '../context/AppStateContext'
import { messages } from '../i18n/messages'
import { CountryCard } from './CountryCard'

export function CountryLibrary() {
  const { countries, locale, setScreen } = useAppState()
  const t = messages[locale]

  return (
    <section aria-labelledby="library-title">
      <div className="library-heading">
        <div>
          <h1 id="library-title">{t['navigation.library']} <span className="country-count">{countries.length}</span></h1>
          <p>{t['country.emptyDescription']}</p>
        </div>
      </div>
      {countries.length === 0 && <h2 className="empty-heading">{t['country.emptyTitle']}</h2>}
      <div className="country-grid">
        {countries.map((country) => <CountryCard key={country.id} country={country} />)}
        <button type="button" className="new-country-card" onClick={() => setScreen('wizard')}>
          <span className="new-country-symbol" aria-hidden="true">＋</span>
          <span>{countries.length === 0 ? t['country.emptyAction'] : t['country.new']}</span>
        </button>
      </div>
    </section>
  )
}
