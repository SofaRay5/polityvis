import { buildParliamentSeats } from '../lib/parliamentLayout'
import { messages } from '../i18n/messages'
import type { Country, Locale } from '../types/politics'

export function ParliamentChart({ country, locale }: { country: Country; locale: Locale }) {
  const t = messages[locale]
  const seats = buildParliamentSeats(country.parties, country.legislature.lowerHouseSeats)
  const majority = Math.floor(country.legislature.lowerHouseSeats / 2) + 1
  const title = `${country.name} ${t['navigation.parliament']}`
  return <section className="parliament" aria-labelledby="parliament-title">
    <div className="panel-heading"><div><p className="eyebrow">{country.legislature.lowerHouseLabel?.[locale] ?? t['wizard.lowerHouse']}</p><h2 id="parliament-title">{title}</h2></div><div className="parliament-stats"><span>{t['overview.totalSeats']} <b>{country.legislature.lowerHouseSeats}</b></span><span>{t['overview.majority']} <b>{majority}</b></span></div></div>
    <svg className="parliament-chart" role="img" aria-labelledby="parliament-title" viewBox="0 0 320 170">
      {seats.map((seat) => <circle key={seat.index} cx={seat.x} cy={seat.y} r="3.4" fill={seat.color} />)}
    </svg>
    <ul className="party-legend">{country.parties.map((group) => <li key={group.id}><span style={{ background: group.color }} />{group.name}<b>{group.seats}</b></li>)}</ul>
  </section>
}
