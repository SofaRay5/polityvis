import { regimePresetList, type RegimePreset } from '../data/regimePresets'
import { regimeQuestions } from '../data/regimeQuestions'
import type { SystemAxis, SystemScores } from '../types/politics'

type Answer = -2 | -1 | 0 | 1 | 2

const axes: SystemAxis[] = ['executive', 'participation', 'centralisation', 'pluralism', 'secularism', 'military']

export const scoreRegimeAnswers = (answers: Record<string, Answer>): SystemScores => {
  const questionIds = new Set(regimeQuestions.map((question) => question.id))
  for (const id of Object.keys(answers)) {
    if (!questionIds.has(id)) throw new Error(`Unknown regime question: ${id}`)
  }

  for (const question of regimeQuestions) {
    if (!(question.id in answers)) throw new Error(`Missing answer for regime question: ${question.id}`)
  }

  return Object.fromEntries(axes.map((axis) => {
    const maximum = regimeQuestions.reduce((total, question) => total + Math.abs(question.weights[axis] ?? 0) * 2, 0)
    const total = regimeQuestions.reduce((sum, question) => sum + answers[question.id] * (question.weights[axis] ?? 0), 0)
    return [axis, Math.max(-100, Math.min(100, Math.round(total / maximum * 100)))]
  })) as SystemScores
}

export const matchRegimePreset = (scores: SystemScores): RegimePreset =>
  regimePresetList.reduce((closest, preset) =>
    axes.reduce((distance, axis) => distance + (scores[axis] - preset.scores[axis]) ** 2, 0) <
      axes.reduce((distance, axis) => distance + (scores[axis] - closest.scores[axis]) ** 2, 0)
      ? preset
      : closest,
  )
