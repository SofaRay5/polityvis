import { relationMessageKey } from '../i18n/messages'
import type { InstitutionRelation } from '../types/politics'

export interface PowerEdge extends InstitutionRelation { labelKey: ReturnType<typeof relationMessageKey> }

const positions: Record<string, [number, number]> = {
  citizens: [200, 50],
  'head-of-state': [90, 155], president: [90, 155],
  'head-of-government': [310, 155], 'prime-minister': [310, 155],
  government: [310, 270],
  'lower-house': [90, 300], 'national-assembly': [90, 300],
  'upper-house': [90, 410], senate: [90, 410],
}

export const powerMapPosition = (id: string) => positions[id]

export const buildPowerEdges = (relations: InstitutionRelation[]): PowerEdge[] =>
  relations.map((relation) => ({ ...relation, labelKey: relationMessageKey(relation.kind) }))
