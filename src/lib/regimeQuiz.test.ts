import { describe, expect, it } from 'vitest'
import { regimeQuestions } from '../data/regimeQuestions'
import { regimePresets } from '../data/regimePresets'
import { matchRegimePreset, scoreRegimeAnswers } from './regimeQuiz'

type Answer = -2 | -1 | 0 | 1 | 2

const zeroScores = {
  executive: 0,
  participation: 0,
  centralisation: 0,
  pluralism: 0,
  secularism: 0,
  military: 0,
}

describe('regime quiz', () => {
  it('normalises unanimous executive-concentration answers to 100', () => {
    const answers: Record<string, Answer> = {}
    regimeQuestions.forEach((question) => {
      answers[question.id] = question.weights.executive === undefined ? 0 : question.weights.executive > 0 ? 2 : -2
    })

    expect(scoreRegimeAnswers(answers).executive).toBe(100)
  })

  it('selects the military preset for its exact score vector', () => {
    expect(matchRegimePreset(regimePresets.militaryCivilian.scores).id).toBe('militaryCivilian')
  })

  it('breaks an equal distance in declared preset order', () => {
    expect(matchRegimePreset(zeroScores).id).toBe('parliamentaryMonarchy')
  })

  it('rejects unknown and missing answers', () => {
    const answers: Record<string, Answer> = {}
    regimeQuestions.forEach((question) => { answers[question.id] = 0 })

    expect(() => scoreRegimeAnswers({ ...answers, unknown: 0 })).toThrow('Unknown regime question: unknown')
    expect(() => scoreRegimeAnswers({})).toThrow(`Missing answer for regime question: ${regimeQuestions[0].id}`)
  })
})
