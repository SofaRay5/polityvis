import { expectTypeOf, it } from 'vitest'
import type { CountryDraft, PartyGroup } from './politics'

it('requires saved party groups to have names while drafts may be partial', () => {
  expectTypeOf<PartyGroup>().toEqualTypeOf<{
    id: string
    name: string
    color: string
    seats: number
  }>()
  expectTypeOf<NonNullable<CountryDraft['parties']>[number]>().toEqualTypeOf<Partial<PartyGroup>>()
})
