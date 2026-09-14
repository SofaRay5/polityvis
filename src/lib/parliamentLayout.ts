import type { PartyGroup } from '../types/politics'

export interface RenderSeat { index: number; groupId: string; color: string; x: number; y: number }

export const parliamentViewBox = { minX: -170, minY: -170, width: 660, height: 340 }

export function buildParliamentSeats(groups: PartyGroup[], totalSeats: number): RenderSeat[] {
  const flattened = groups.flatMap((group) => Array.from({ length: group.seats }, () => group))
  const seats = flattened.slice(0, totalSeats)
  const rings = Math.max(1, Math.ceil(Math.sqrt(totalSeats / 2)))
  const radii = Array.from({ length: rings }, (_, ring) => rings === 1 ? 20 : 20 + ring * (135 / (rings - 1)))
  let offset = 0

  return radii.flatMap((radius) => {
    const count = Math.min(Math.floor(Math.PI * radius / 7.9), seats.length - offset)
    const ringSeats = seats.slice(offset, offset + count)
    offset += count
    return ringSeats.map((group, index) => {
      const angle = count === 1 ? Math.PI / 2 : Math.PI - (Math.PI * index / (count - 1))
      return { index: offset - count + index, groupId: group.id, color: group.color, x: 160 + radius * Math.cos(angle), y: 160 - radius * Math.sin(angle) }
    })
  })
}
