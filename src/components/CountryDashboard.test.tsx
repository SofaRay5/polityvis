import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { franceSeed } from '../data/france'
import { regimePresetList } from '../data/regimePresets'
import { createCountryFromDraft } from '../lib/countryBuilder'
import { CountryDashboard } from './CountryDashboard'

describe('dashboard selection labels', () => {
  it('translates the known France selection descriptions in Chinese', () => {
    const html = renderToStaticMarkup(<CountryDashboard country={franceSeed} locale="zh" />)
    expect(html).toContain('直选')
    expect(html).toContain('间接选举')
    expect(html).toContain('由共和国总统任命')
    expect(html).not.toContain('Direct universal suffrage')
    expect(html).not.toContain('Indirect suffrage')
  })

  it('renders every France system score as a labeled value', () => {
    const html = renderToStaticMarkup(<CountryDashboard country={franceSeed} locale="zh" onEdit={() => undefined} />)
    expect(html).toContain('data-score-axis="executive"')
    expect(html).toContain('>30</b>')
    expect(html).toContain('>20</b>')
    expect(html).toContain('>60</b>')
    expect(html).toContain('>65</b>')
    expect(html).toContain('>90</b>')
    expect(html).toContain('>-90</b>')
  })

  it.each(regimePresetList)('localizes the $id preset method codes in both languages', (preset) => {
    const country = createCountryFromDraft(preset.default, preset.id, '2026-09-16')
    for (const locale of ['zh', 'en'] as const) {
      const html = renderToStaticMarkup(<CountryDashboard country={country} locale={locale} />)
      for (const item of [...country.executiveOffices, ...country.chambers]) expect(html).not.toContain(`>${item.selectionMethod} ·`)
    }
  })

  it('keeps user-defined selection descriptions readable', () => {
    const country = structuredClone(franceSeed)
    country.executiveOffices[0].selectionMethod = 'Custom civic convention'
    expect(renderToStaticMarkup(<CountryDashboard country={country} locale="zh" />)).toContain('Custom civic convention')
  })
})
