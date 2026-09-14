import { relationMessageKey } from '../i18n/messages'
import type { InstitutionRelation } from '../types/politics'

export interface PowerEdge extends InstitutionRelation { labelKey: ReturnType<typeof relationMessageKey> }

export const buildPowerEdges = (relations: InstitutionRelation[]): PowerEdge[] =>
  relations.map((relation) => ({ ...relation, labelKey: relationMessageKey(relation.kind) }))
