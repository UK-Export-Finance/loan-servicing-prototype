import { NumberValues, StringValues } from '../utils/type-utils'
import { Drawing } from './drawing'
import { LoanServicingEvent } from './events'
import {
  Facility,
  FacilityResponseDto,
  NewFacilityRequestDto,
} from './facility'
import { ProjectedEvent } from './projectedEvents'

export type Participation = Omit<
  Facility,
  'participations' | 'participationsConfig'
> & {
  parentFacility: Facility
  participantShare: string
  participations: []
  participationsConfig: []
}

export type ParticipationResponseDto = Omit<
  Participation,
  'drawings' | 'parentFacility'
> & {
  drawings: Omit<Drawing, 'facility'>[]
  parentFacility: FacilityResponseDto
}

export type NewParticipationRequestDto = NewFacilityRequestDto & {
  parentFacilityId: string
  participantShare: string
}

export type NewParticipationOnFacility = NewParticipationRequestDto & {
  participantStreamId: string
}

export const participationEventIdMappingndex: Partial<{
  [key in ProjectedEvent['type']]: (keyof StringValues<
    Extract<LoanServicingEvent, { type: key }>['eventData']
  >)[]
}> = {
  AddDrawingToFacility: ['streamId'],
}

export const participationEventValueModificationIndex: Partial<{
  [key in ProjectedEvent['type']]: (keyof NumberValues<
    Extract<LoanServicingEvent, { type: key }>['eventData']
  >)[]
}> = {
  WithdrawFromDrawing: ['amount'],
  CreateNewParticipation: ['facilityAmount'],
}
