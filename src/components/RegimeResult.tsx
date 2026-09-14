import { regimePresetList, type RegimePreset } from '../data/regimePresets'
import { messages } from '../i18n/messages'
import { matchRegimePreset } from '../lib/regimeQuiz'
import type { Locale, SystemAxis, SystemScores } from '../types/politics'

const axes: SystemAxis[] = ['executive', 'participation', 'centralisation', 'pluralism', 'secularism', 'military']

export function RegimeResult({ locale, scores, onBack, onContinue }: { locale: Locale; scores: SystemScores; onBack: () => void; onContinue: (preset: RegimePreset) => void }) {
  const t = messages[locale]
  const selected = matchRegimePreset(scores)
  const alternatives = regimePresetList.filter((preset) => preset.id !== selected.id)

  return <div className="wizard-panel result-panel">
    <h2>{t['result.title']}</h2>
    <p>{t['result.description']}</p>
    <div className="score-bars">
      {axes.map((axis) => <label key={axis}>{t[`result.axis.${axis}`]}
        <progress max="100" value={(scores[axis] + 100) / 2}>{scores[axis]}</progress><span>{scores[axis]}</span>
      </label>)}
    </div>
    <h3>{t['result.closest']}</h3>
    <Preset preset={selected} locale={locale} onContinue={onContinue} />
    <h3>{t['result.alternatives']}</h3>
    <div className="preset-list">{alternatives.map((preset) => <Preset key={preset.id} preset={preset} locale={locale} onContinue={onContinue} />)}</div>
    <div className="wizard-actions"><button type="button" className="button-subtle" onClick={onBack}>{t['wizard.back']}</button></div>
  </div>
}

function Preset({ preset, locale, onContinue }: { preset: RegimePreset; locale: Locale; onContinue: (preset: RegimePreset) => void }) {
  const t = messages[locale]
  return <article className="preset-card"><strong>{preset.name[locale]}</strong><button type="button" className="button-subtle" onClick={() => onContinue(preset)}>{t['result.usePreset']}</button></article>
}
