import { describe, expect, it } from 'vitest'
import { regimePresetList } from './regimePresets'

describe('regime presets', () => {
  it('offers fifteen representative starting regimes', () => {
    expect(regimePresetList).toHaveLength(15)
    expect(new Set(regimePresetList.map((preset) => preset.id)).size).toBe(15)
  })
})
