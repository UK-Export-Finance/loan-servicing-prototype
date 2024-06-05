import { Drawing } from './drawing'
import {
  Facility,
  FacilityResponseDto,
  NewFacilityRequestDto,
} from './facility'

export type Participation = Omit<
  Facility,
  'participations' | 'participationsConfig'
> & {
  parentFacility: Facility
  participantShare: string
  participation: []
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
