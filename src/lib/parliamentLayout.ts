import type { PartyGroup } from '../types/politics'

export interface RenderSeat { index: number; groupId: string; color: string; x: number; y: number; radius: number }

export const parliamentViewBox = { minX: -170, minY: -170, width: 660, height: 340 }

export function sortPartyGroups(groups: PartyGroup[]): PartyGroup[] {
  return [...groups].sort((a, b) => a.ideologyPosition - b.ideologyPosition || b.seats - a.seats || a.name.localeCompare(b.name))
}

export function buildParliamentSeats(groups: PartyGroup[], totalSeats: number): RenderSeat[] {
  const flattened = sortPartyGroups(groups).flatMap((group) => Array.from({ length: group.seats }, () => group))
  const seats = flattened.slice(0, totalSeats)
  const rings = Math.max(1, Math.ceil(Math.sqrt(totalSeats / 2)))
  const radii = Array.from({ length: rings }, (_, ring) => rings === 1 ? 20 : 20 + ring * (135 / (rings - 1)))
  const totalRadius = radii.reduce((sum, radius) => sum + radius, 0)
  let usedRadius = 0
  const points = radii.flatMap((radius) => {
    const start = Math.round(usedRadius / totalRadius * seats.length)
    usedRadius += radius
    const count = Math.round(usedRadius / totalRadius * seats.length) - start
    return Array.from({ length: count }, (_, index) => {
      const angle = count === 1 ? Math.PI / 2 : Math.PI - (Math.PI * index / (count - 1))
      return { x: 160 + radius * Math.cos(angle), y: 160 - radius * Math.sin(angle) }
    })
  })
  points.sort((a, b) => Math.atan2(160 - b.y, b.x - 160) - Math.atan2(160 - a.y, a.x - 160))
  const radius = Math.min(3.4, 54 / Math.max(1, rings - 1), Math.PI * totalRadius / Math.max(1, seats.length) * 0.4)
  return points.map((point, index) => ({ ...point, index, groupId: seats[index].id, color: seats[index].color, radius }))
}
