import { NewFacilityRequestDto } from '../facility'
import { ParticipationProperties } from '../strategies/participation'
import { EventBase } from './eventBase'

type ParticipationEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = EventBase<Type, Version, Data, 'facility'>

export type CreateNewParticipationEvent = ParticipationEventBase<
  'CreateNewParticipation',
  1,
  ParticipationProperties & NewFacilityRequestDto
>

export type ParticipationEvent = CreateNewParticipationEvent
