import { describe, expect, it } from 'vitest'
import { regimeQuestions } from '../data/regimeQuestions'
import { regimePresets, regimePresetList } from '../data/regimePresets'
import { chooseRegimeDraft, matchRegimePreset, scoreRegimeAnswers } from './regimeQuiz'
import { createCountryFromDraft } from './countryBuilder'
import { normaliseCountry } from './countryStorage'

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
  it('refreshes scores when choosing the same preset while preserving institution edits', () => {
    const preset = regimePresets.parliamentaryMonarchy
    const edited = structuredClone(preset.default)
    edited.name = 'Edited country'
    edited.executiveOffices![0].label.en = 'Edited crown'
    edited.courts!.push({ id: 'appeals', label: { en: 'Appeals', zh: '上诉' }, level: 2 })
    const updated = chooseRegimeDraft(edited, preset, zeroScores)
    const country = createCountryFromDraft(updated, 'edited', '2026-09-16')
    expect(country.systemScores).toEqual(zeroScores)
    expect(country.name).toBe('Edited country')
    expect(country.executiveOffices[0].label.en).toBe('Edited crown')
    expect(country.courts).toHaveLength(2)
    expect(normaliseCountry(JSON.parse(JSON.stringify(country)))).toEqual(country)
    expect(edited.systemScores).toEqual(preset.scores)
  })

  it('starts a fresh editable draft when a different preset is chosen', () => {
    const draft = chooseRegimeDraft(regimePresets.absoluteMonarchy.default, regimePresets.federalPresidential, zeroScores)
    expect(draft.presetId).toBe('federalPresidential')
    expect(draft.systemScores).toEqual(zeroScores)
    draft.executiveOffices![0].label.en = 'Changed'
    expect(regimePresets.federalPresidential.default.executiveOffices![0].label.en).toBe('President')
  })
  it.each(regimePresetList)('matches the exact vector for $id', (preset) => {
    expect(matchRegimePreset(preset.scores).id).toBe(preset.id)
  })
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
