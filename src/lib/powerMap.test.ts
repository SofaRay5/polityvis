import { expect, it } from 'vitest'
import { buildPowerEdges, powerMapPosition } from './powerMap'

it('maps a relation to positioned SVG edge data', () => {
  expect(buildPowerEdges([{ from: 'citizens', to: 'lower-house', kind: 'elects' }])).toEqual([
    expect.objectContaining({ from: 'citizens', to: 'lower-house', kind: 'elects', labelKey: 'relation.elects' }),
  ])
})

it('positions France snapshot institution ids', () => {
  expect(powerMapPosition('president')).toBeDefined()
  expect(powerMapPosition('national-assembly')).toBeDefined()
})
