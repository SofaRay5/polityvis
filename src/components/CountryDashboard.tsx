import html2canvas from 'html2canvas'
import { useRef, useState } from 'react'
import { regimePresets } from '../data/regimePresets'
import { messages } from '../i18n/messages'
import { downloadSvgPng, isExportInProgress, safeExportFilename } from '../lib/pngExport'
import type { Country, Locale, SystemAxis } from '../types/politics'
import { ParliamentChart } from './ParliamentChart'
import { PowerMap } from './PowerMap'
import '../styles/dashboard.css'

const axes: SystemAxis[] = ['executive', 'participation', 'centralisation', 'pluralism', 'secularism', 'military']
type ExportKind = 'overview' | 'parliament'

export function CountryDashboard({ country, locale }: { country: Country; locale: Locale }) {
  const t = messages[locale]
  const dashboardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState<ExportKind | null>(null)
  const [exportError, setExportError] = useState(false)
  const filename = (kind: ExportKind) => safeExportFilename(country.name, kind, new Date().toISOString().slice(0, 10))

  const exportDashboard = async () => {
    if (!dashboardRef.current) return
    setExporting('overview')
    setExportError(false)
    try {
      const canvas = await html2canvas(dashboardRef.current, { backgroundColor: '#101823', scale: 2 })
      const link = document.createElement('a')
      link.download = filename('overview')
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      setExportError(true)
    } finally {
      setExporting(null)
    }
  }

  const exportParliament = async () => {
    const svg = dashboardRef.current?.querySelector<SVGSVGElement>('.parliament-chart')
    if (!svg) return
    setExporting('parliament')
    setExportError(false)
    try {
      await downloadSvgPng(svg, filename('parliament'))
    } catch {
      setExportError(true)
    } finally {
      setExporting(null)
    }
  }

  const preset = regimePresets[country.presetId]
  return <section className="overview"><div className="dashboard" ref={dashboardRef}>
    <header className="dashboard-hero">
      <div><p className="eyebrow">{preset.name[locale]}</p><h1>{country.name}</h1><p>{country.structure.stateForm} · {country.structure.governmentForm}</p></div>
      <div className="hero-facts"><span>{t['overview.totalSeats']}<b>{country.legislature.lowerHouseSeats}</b></span><span>{t['overview.majority']}<b>{Math.floor(country.legislature.lowerHouseSeats / 2) + 1}</b></span></div>
    </header>

    <div className="dashboard-grid">
      <section className="dashboard-panel score-panel"><div className="panel-heading"><div><p className="eyebrow">{t['dashboard.scores']}</p><h2>{t['dashboard.systemProfile']}</h2></div></div>{axes.map((axis) => <div className="score-row" key={axis}><span>{t[`result.axis.${axis}`]}</span><div aria-label={`${t[`result.axis.${axis}`]}: ${country.systemScores[axis]}`} className="score-track"><i style={{ width: `${Math.abs(country.systemScores[axis]) / 2}%`, marginLeft: country.systemScores[axis] < 0 ? `${50 - Math.abs(country.systemScores[axis]) / 2}%` : '50%' }} /></div><b>{country.systemScores[axis]}</b></div>)}</section>

      <section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">{t['overview.structure']}</p><h2>{t['dashboard.facts']}</h2></div></div><dl className="fact-list"><div><dt>{t['overview.headOfState']}</dt><dd>{country.headOfState.title[locale]}{country.headOfState.officeholder && ` · ${country.headOfState.officeholder}`}</dd></div><div><dt>{t['overview.headOfGovernment']}</dt><dd>{country.headOfGovernment.title[locale]}{country.headOfGovernment.officeholder && ` · ${country.headOfGovernment.officeholder}`}</dd></div><div><dt>{t['overview.legislature']}</dt><dd>{country.legislature.lowerHouseLabel?.[locale] ?? t['wizard.lowerHouse']}</dd></div></dl></section>

      <section className="dashboard-panel offices-panel"><div className="panel-heading"><div><p className="eyebrow">{t['editor.offices']}</p><h2>{t['dashboard.executive']}</h2></div></div><ul className="detail-list">{country.executiveOffices.map((office) => <li key={office.id}><b>{office.label[locale]}</b><span>{office.selectionMethod} · {office.terms} {t['dashboard.years']}</span></li>)}</ul></section>

      <div className="dashboard-panel power-panel"><PowerMap country={country} locale={locale} /></div>

      <div className="dashboard-panel parliament-panel"><ParliamentChart country={country} locale={locale} /></div>

      <section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">{t['editor.chambers']}</p><h2>{t['dashboard.chambers']}</h2></div></div><ul className="detail-list">{country.chambers.map((chamber) => <li key={chamber.id}><b>{chamber.label[locale]}</b><span>{chamber.seats} · {chamber.selectionMethod}</span></li>)}</ul></section>

      <section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">{t['editor.courts']}</p><h2>{t['dashboard.courts']}</h2></div></div>{country.courts.length ? <ul className="detail-list">{country.courts.map((court) => <li key={court.id}><b>{court.label[locale]}</b><span>{t['dashboard.level']} {court.level}</span></li>)}</ul> : <p className="empty-detail">{t['dashboard.none']}</p>}</section>

      <section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">{t['editor.territories']}</p><h2>{t['dashboard.territories']}</h2></div></div><ul className="detail-list">{country.territorialLevels.map((level) => <li key={level.id}><b>{level.label[locale]}</b><span>{level.count} · {t['dashboard.autonomy']} {level.autonomy}%</span></li>)}</ul></section>

      <section className="dashboard-panel sources-panel"><div className="panel-heading"><div><p className="eyebrow">{t['overview.snapshot']}</p><h2>{t['overview.sources']}</h2></div></div>{country.snapshot ? <><p className="snapshot-date">{t['overview.snapshotDate']}: {country.snapshot.date}</p><ul className="source-list">{country.snapshot.sources.map((source) => <li key={source}><a href={source} target="_blank" rel="noreferrer">{source}</a></li>)}</ul></> : <p className="empty-detail">{t['overview.noSnapshot']}</p>}</section>
    </div>
  </div>
  <div className="export-controls"><button type="button" className="button-subtle" onClick={exportDashboard} disabled={isExportInProgress(exporting)}>{exporting === 'overview' ? t['dashboard.exporting'] : t['dashboard.exportOverview']}</button><button type="button" className="button-primary" onClick={exportParliament} disabled={isExportInProgress(exporting)}>{exporting === 'parliament' ? t['dashboard.exporting'] : t['dashboard.exportParliament']}</button>{exportError && <p role="alert">{t['dashboard.exportError']}</p>}</div>
  </section>
}
