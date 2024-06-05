import { ParticipationEvent } from '../../events/participationEvents'
import { ProjectEvent } from '../projectedEventBase'

export type ProjectedParticipationEvent =
  | (ProjectEvent<ParticipationEvent> & {
      streamId: string
    })
