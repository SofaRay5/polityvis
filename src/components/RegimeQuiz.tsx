import { regimeQuestions } from '../data/regimeQuestions'
import { messages } from '../i18n/messages'
import { scoreRegimeAnswers } from '../lib/regimeQuiz'
import type { Locale, SystemScores } from '../types/politics'

type Answer = -2 | -1 | 0 | 1 | 2

const choices: Answer[] = [-2, -1, 0, 1, 2]
const answerKeys = ['quiz.stronglyDisagree', 'quiz.disagree', 'quiz.neutral', 'quiz.agree', 'quiz.stronglyAgree'] as const

export function RegimeQuiz({ locale, index, answers, onIndexChange, onAnswersChange, onComplete }: { locale: Locale; index: number; answers: Record<string, Answer>; onIndexChange: (index: number) => void; onAnswersChange: (answers: Record<string, Answer>) => void; onComplete: (scores: SystemScores) => void }) {
  const t = messages[locale]
  const question = regimeQuestions[index]
  const answer = answers[question.id]

  const next = () => {
    if (answer === undefined) return
    if (index === regimeQuestions.length - 1) onComplete(scoreRegimeAnswers(answers))
    else onIndexChange(index + 1)
  }

  return <div className="wizard-panel quiz-panel">
    <p className="quiz-count">{t['quiz.question']} {index + 1} / {regimeQuestions.length}</p>
    <h2>{question.text[locale]}</h2>
    <div className="quiz-answers" role="group" aria-label={t['quiz.answer']}>
      {choices.map((value, answerIndex) => <button
        type="button"
        className={answer === value ? 'is-selected' : ''}
        aria-pressed={answer === value}
        key={value}
        onClick={() => onAnswersChange({ ...answers, [question.id]: value })}
      >{t[answerKeys[answerIndex]]}</button>)}
    </div>
    <div className="wizard-actions">
      <button type="button" className="button-subtle" disabled={index === 0} onClick={() => onIndexChange(index - 1)}>{t['wizard.back']}</button>
      <button type="button" className="button-primary" disabled={answer === undefined} onClick={next}>{index === regimeQuestions.length - 1 ? t['quiz.finish'] : t['wizard.next']}</button>
    </div>
  </div>
}
