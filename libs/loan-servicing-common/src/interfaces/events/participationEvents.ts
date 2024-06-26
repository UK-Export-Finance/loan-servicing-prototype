import {
  NewParticipationOnFacility,
  NewParticipationRequestDto,
} from '../participation'
import { EventBase } from './eventBase'

type ParticipationEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = EventBase<Type, Version, Data, 'participation'>

export type CreateNewParticipationEvent = ParticipationEventBase<
  'CreateNewParticipation',
  1,
  NewParticipationRequestDto
>

export type AddParticipationToFacilityEvent = ParticipationEventBase<
  'AddParticipationToFacility',
  1,
  NewParticipationOnFacility
>

export type ParticipationEvent =
  | CreateNewParticipationEvent
  | AddParticipationToFacilityEvent
