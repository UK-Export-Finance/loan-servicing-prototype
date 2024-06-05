import { NewParticipationRequestDto } from '../participation'
import { EventBase } from './eventBase'

type ParticipationEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = EventBase<Type, Version, Data, 'facility'>

export type CreateNewParticipationEvent = ParticipationEventBase<
  'CreateNewParticipation',
  1,
  NewParticipationRequestDto
>

export type ParticipationEvent = CreateNewParticipationEvent
