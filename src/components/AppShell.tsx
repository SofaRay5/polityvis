import { useAppState } from '../context/AppStateContext'
import { messages } from '../i18n/messages'
import { CountryLibrary } from './CountryLibrary'
import { CountryWizard } from './CountryWizard'
import { CountryDashboard } from './CountryDashboard'
import '../styles/parliament.css'
import '../styles/library.css'

export function AppShell() {
  const { countries, activeCountryId, screen, locale, setLocale, setScreen } = useAppState()
  const t = messages[locale]
  const activeCountry = countries.find((country) => country.id === activeCountryId)
  let content
  if (screen === 'library') {
    content = <CountryLibrary />
  } else if (screen === 'wizard') {
    content = <CountryWizard />
  } else {
    content = activeCountry ? <CountryDashboard country={activeCountry} locale={locale} /> : <section className="screen-placeholder">
      <button type="button" className="button-subtle" onClick={() => setScreen('library')}>← {t['navigation.library']}</button>
      <h1>{t['navigation.library']}</h1>
      <p>{locale === 'zh' ? '此页面即将推出。' : 'This screen is coming soon.'}</p>
    </section>
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button type="button" className="brand" onClick={() => setScreen('library')} aria-label={`${t['app.title']} · ${t['navigation.library']}`}>
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
            <path d="M4 11 16 4l12 7M5 27h22M8 14v9m8-9v9m8-9v9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{t['app.title']}</span>
        </button>
        <div className="header-actions">
          <div className="locale-toggle">
            <button type="button" lang="zh-CN" aria-pressed={locale === 'zh'} onClick={() => setLocale('zh')}>{t['language.zh']}</button>
            <button type="button" lang="en" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>{t['language.en']}</button>
          </div>
          <button type="button" className="button-primary" onClick={() => setScreen('wizard')}>
            <span aria-hidden="true">＋</span> {t['country.new']}
          </button>
        </div>
      </header>
      <main className="app-main">
        {content}
      </main>
    </div>
  )
}
