import { AddFacilityFeeEvent } from '../../events/facilityEvents'
import { ParticipationEvent } from '../../events/participationEvents'
import { ProjectEvent } from '../projectedEventBase'

export type ProjectedParticipationEvent =
  | AddFacilityFeeEvent
  | (ProjectEvent<ParticipationEvent> & {
      streamId: string
    })
