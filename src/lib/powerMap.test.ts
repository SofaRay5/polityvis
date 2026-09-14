import { expect, it } from 'vitest'
import { buildPowerEdges } from './powerMap'

it('maps a relation to positioned SVG edge data', () => {
  expect(buildPowerEdges([{ from: 'citizens', to: 'lower-house', kind: 'elects' }])).toEqual([
    expect.objectContaining({ from: 'citizens', to: 'lower-house', kind: 'elects', labelKey: 'relation.elects' }),
  ])
})
