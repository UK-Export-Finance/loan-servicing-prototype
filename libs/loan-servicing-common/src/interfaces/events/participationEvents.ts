import { NewFacilityRequestDto } from '../facility'
import { EventBase } from './eventBase'

type ParticipationEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = EventBase<Type, Version, Data, 'facility'>

export type CreateNewParticipationEvent = ParticipationEventBase<
  'CreateNewParticipation',
  1,
  NewFacilityRequestDto & {
    parentFacilityId: string
  }
>

export type ParticipationEvent = CreateNewParticipationEvent
