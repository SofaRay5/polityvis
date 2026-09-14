import { useState } from 'react'
import type { RegimePreset } from '../data/regimePresets'
import { useAppState } from '../context/AppStateContext'
import { messages } from '../i18n/messages'
import type { CountryDraft, SystemScores } from '../types/politics'
import { CountryEditor } from './CountryEditor'
import { RegimeQuiz } from './RegimeQuiz'
import { RegimeResult } from './RegimeResult'
import { WizardProgress } from './WizardProgress'
import '../styles/wizard.css'

type Stage = 'quiz' | 'result' | 'editor'

export function CountryWizard() {
  const { locale, setScreen } = useAppState()
  const t = messages[locale]
  const [stage, setStage] = useState<Stage>('quiz')
  const [scores, setScores] = useState<SystemScores | null>(null)
  const [draft, setDraft] = useState<CountryDraft | null>(null)
  const stages: Stage[] = ['quiz', 'result', 'editor']

  const choosePreset = (preset: RegimePreset) => {
    setDraft(structuredClone({ ...preset.default, presetId: preset.id, systemScores: scores ?? preset.scores }))
    setStage('editor')
  }

  return <section className="wizard" aria-labelledby="wizard-title">
    <button type="button" className="button-subtle" onClick={() => setScreen('library')}>← {t['wizard.cancel']}</button>
    <div className="wizard-heading"><p className="eyebrow">POLITYVIS</p><h1 id="wizard-title">{t['wizard.title']}</h1></div>
    <WizardProgress step={stages.indexOf(stage)} locale={locale} />
    {stage === 'quiz' && <RegimeQuiz locale={locale} onComplete={(value) => { setScores(value); setStage('result') }} />}
    {stage === 'result' && scores && <RegimeResult locale={locale} scores={scores} onBack={() => setStage('quiz')} onContinue={choosePreset} />}
    {stage === 'editor' && draft && <CountryEditor initialDraft={draft} onBack={() => setStage('result')} />}
  </section>
}
