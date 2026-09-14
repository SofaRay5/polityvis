import type { PartyGroup } from '../types/politics'

export interface RenderSeat { index: number; groupId: string; color: string; x: number; y: number }

export function buildParliamentSeats(groups: PartyGroup[], totalSeats: number): RenderSeat[] {
  const flattened = groups.flatMap((group) => Array.from({ length: group.seats }, () => group))
  const seats = flattened.slice(0, totalSeats)
  const rows = Math.max(1, Math.ceil(Math.sqrt(totalSeats)))
  return seats.map((group, index) => {
    const row = index % rows
    const rowStart = index - row
    const rowLength = Math.min(rows, seats.length - rowStart)
    const angle = rowLength === 1 ? Math.PI / 2 : Math.PI - (Math.PI * (index - rowStart) / (rowLength - 1))
    const radius = 34 + row * 12
    return { index, groupId: group.id, color: group.color, x: 160 + radius * Math.cos(angle), y: 160 - radius * Math.sin(angle) }
  })
}
