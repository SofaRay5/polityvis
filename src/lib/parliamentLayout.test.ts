import { describe, expect, it } from 'vitest'
import { franceSeed } from '../data/france'
import { buildParliamentSeats, parliamentViewBox, sortPartyGroups } from './parliamentLayout'

const groups = [
  { id: 'red', name: 'Red', color: '#e55', seats: 2, ideologyPosition: -50 },
  { id: 'blue', name: 'Blue', color: '#55e', seats: 3, ideologyPosition: 50 },
]

const unsortedGroups = [
  { id: 'right', name: 'Right', color: '#e55', seats: 2, ideologyPosition: 50 },
  { id: 'centre-small', name: 'Centre Small', color: '#55e', seats: 2, ideologyPosition: 0 },
  { id: 'left', name: 'Left', color: '#5e5', seats: 3, ideologyPosition: -50 },
  { id: 'centre-large', name: 'Centre Large', color: '#ee5', seats: 4, ideologyPosition: 0 },
]

describe('sortPartyGroups', () => {
  it('sorts groups from left to right and seats-descending within a tie', () => {
    expect(sortPartyGroups(unsortedGroups).map((group) => group.id)).toEqual(['left', 'centre-large', 'centre-small', 'right'])
  })

  it('returns a sorted copy without mutating the source', () => {
    const original = [...unsortedGroups]

    expect(sortPartyGroups(unsortedGroups)).not.toBe(unsortedGroups)
    expect(unsortedGroups).toEqual(original)
  })
})

describe('buildParliamentSeats', () => {
  it('places France parties in contiguous left-to-right angular blocks', () => {
    const seats = buildParliamentSeats(franceSeed.parties, 577)
    const angularOrder = [...seats].sort((a, b) => Math.atan2(160 - b.y, b.x - 160) - Math.atan2(160 - a.y, a.x - 160))
    const partyOrder = angularOrder.filter((seat, index) => !index || seat.groupId !== angularOrder[index - 1].groupId).map((seat) => seat.groupId)
    expect(partyOrder).toEqual(['lfi-nfp', 'gdr', 'ecologiste', 'socialistes', 'non-inscrits', 'liot', 'dem', 'epr', 'horizons', 'dr', 'udr', 'rn'])
  })

  it.each([1, 577, 1000, 2000])('renders every seat once within bounds for a %i-seat chamber', (total) => {
    const seats = buildParliamentSeats([{ ...groups[0], seats: total }], total)
    expect(seats).toHaveLength(total)
    expect(new Set(seats.map((seat) => `${seat.x},${seat.y}`)).size).toBe(total)
    expect(seats.every((seat) => seat.x >= parliamentViewBox.minX && seat.x <= parliamentViewBox.minX + parliamentViewBox.width && seat.y >= parliamentViewBox.minY && seat.y <= parliamentViewBox.minY + parliamentViewBox.height)).toBe(true)
  })
  it('returns one render seat per configured seat', () => {
    expect(buildParliamentSeats(groups, 5)).toHaveLength(5)
  })

  it('keeps every point on or above the baseline', () => {
    expect(buildParliamentSeats(groups, 5).every((seat) => seat.y <= 160)).toBe(true)
  })

  it('uses a view box that contains every France seat', () => {
    const seats = buildParliamentSeats(
      [{ id: 'all', name: 'All', color: '#000', seats: 577, ideologyPosition: 0 }],
      577,
    )
    expect(seats.every((seat) => (
      seat.x >= parliamentViewBox.minX &&
      seat.x <= parliamentViewBox.minX + parliamentViewBox.width &&
      seat.y >= parliamentViewBox.minY &&
      seat.y <= parliamentViewBox.minY + parliamentViewBox.height
    ))).toBe(true)
  })

  it('gives every France seat its own position', () => {
    const seats = buildParliamentSeats(
      [{ id: 'all', name: 'All', color: '#000', seats: 577, ideologyPosition: 0 }],
      577,
    )
    expect(new Set(seats.map((seat) => `${seat.x},${seat.y}`))).toHaveLength(577)
  })

  it('assigns contiguous seats to each group', () => {
    expect(buildParliamentSeats(groups, 5).map((seat) => seat.groupId)).toEqual(['red', 'red', 'blue', 'blue', 'blue'])
  })

  it('keeps every group contiguous in the ordered seat stream', () => {
    expect(buildParliamentSeats([
      { id: 'left', name: 'Left', color: '#5e5', seats: 2, ideologyPosition: -50 },
      { id: 'centre', name: 'Centre', color: '#ee5', seats: 2, ideologyPosition: 0 },
      { id: 'right', name: 'Right', color: '#e55', seats: 2, ideologyPosition: 50 },
    ], 6).map((seat) => seat.groupId)).toEqual(['left', 'left', 'centre', 'centre', 'right', 'right'])
  })
})
