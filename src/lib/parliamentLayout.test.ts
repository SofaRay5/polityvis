import { describe, expect, it } from 'vitest'
import { buildParliamentSeats } from './parliamentLayout'

const groups = [
  { id: 'red', name: 'Red', color: '#e55', seats: 2 },
  { id: 'blue', name: 'Blue', color: '#55e', seats: 3 },
]

describe('buildParliamentSeats', () => {
  it('returns one render seat per configured seat', () => {
    expect(buildParliamentSeats(groups, 5)).toHaveLength(5)
  })

  it('keeps every point on or above the baseline', () => {
    expect(buildParliamentSeats(groups, 5).every((seat) => seat.y <= 160)).toBe(true)
  })

  it('assigns contiguous seats to each group', () => {
    expect(buildParliamentSeats(groups, 5).map((seat) => seat.groupId)).toEqual(['red', 'red', 'blue', 'blue', 'blue'])
  })
})
