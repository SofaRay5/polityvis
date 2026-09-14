import { useState } from 'react'
import { messages } from '../i18n/messages'
import type { Country } from '../types/politics'
import { ParliamentChart } from './ParliamentChart'
import { PowerMap } from './PowerMap'
import '../styles/overview.css'

export function CountryOverview({ country, locale }: { country: Country; locale: 'zh' | 'en' }) {
  const t = messages[locale]
  const [tab, setTab] = useState<'summary' | 'parliament' | 'power'>('summary')
  return <section className="overview"><button type="button" className="tab" aria-selected={tab === 'summary'} onClick={() => setTab('summary')}>{t['navigation.summary']}</button><button type="button" className="tab" aria-selected={tab === 'parliament'} onClick={() => setTab('parliament')}>{t['navigation.parliament']}</button><button type="button" className="tab" aria-selected={tab === 'power'} onClick={() => setTab('power')}>{t['navigation.power']}</button>
    {tab === 'summary' && <div className="overview-summary"><p className="eyebrow">{country.structure.governmentForm}</p><h1>{country.name}</h1><div className="summary-grid"><article><h2>{t['overview.structure']}</h2><p>{country.structure.stateForm}</p></article><article><h2>{t['overview.headOfState']}</h2><p>{country.headOfState.title[locale]}</p></article><article><h2>{t['overview.headOfGovernment']}</h2><p>{country.headOfGovernment.title[locale]}</p></article></div>{country.snapshot ? <div className="snapshot"><span>{t['overview.snapshotDate']}: {country.snapshot.date}</span><span>{t['overview.sources']}: {country.snapshot.sources.map((source) => <a key={source} href={source} target="_blank" rel="noreferrer">↗</a>)}</span></div> : <p className="snapshot">{t['overview.noSnapshot']}</p>}</div>}
    {tab === 'parliament' && <ParliamentChart country={country} locale={locale} />}
    {tab === 'power' && <PowerMap country={country} locale={locale} />}
  </section>
}
