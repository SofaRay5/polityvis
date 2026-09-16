import { useId } from 'react'
import { buildPowerEdges, powerMapPosition } from '../lib/powerMap'
import { messages } from '../i18n/messages'
import type { Country, Locale } from '../types/politics'
import { countryName } from '../lib/countryDisplay'

export function PowerMap({ country, locale }: { country: Country; locale: Locale }) {
  const t = messages[locale]
  const titleId = useId()
  const institutions = country.institutions.filter((institution) => powerMapPosition(institution.id))
  const edges = buildPowerEdges(country.relations).filter((edge) => powerMapPosition(edge.from) && powerMapPosition(edge.to))
  return <section className="power-map" aria-labelledby={titleId}><div className="panel-heading"><div><p className="eyebrow">{t['navigation.power']}</p><h2 id={titleId}>{countryName(country, locale)}</h2></div></div>
    <svg role="img" aria-labelledby={titleId} viewBox="0 0 400 470">
      <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="#8dcbff" /></marker></defs>
      {edges.map((edge, index) => { const [x1, y1] = powerMapPosition(edge.from)!; const [x2, y2] = powerMapPosition(edge.to)!; return <g key={`${edge.from}-${edge.to}-${index}`}><line x1={x1} y1={y1 + 22} x2={x2} y2={y2 - 22} markerEnd="url(#arrow)" /><text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5}>{t[edge.labelKey]}</text></g> })}
      {institutions.map((institution) => { const [x, y] = powerMapPosition(institution.id)!; return <g key={institution.id} transform={`translate(${x - 58} ${y - 22})`}><rect width="116" height="44" rx="8" /><text x="58" y="27">{institution.label[locale]}</text></g> })}
    </svg>
  </section>
}
