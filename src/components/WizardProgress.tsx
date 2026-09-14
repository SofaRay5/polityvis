import { messages } from '../i18n/messages'
import type { Locale } from '../types/politics'

const steps = ['profile', 'executive', 'legislature', 'parties'] as const

export function WizardProgress({ step, locale }: { step: number; locale: Locale }) {
  const t = messages[locale]
  return <ol className="wizard-progress">
    {steps.map((name, index) => <li key={name} className={index <= step ? 'is-current' : ''}>
      <span>{index + 1}</span>{t[`wizard.step.${name}`]}
    </li>)}
  </ol>
}
