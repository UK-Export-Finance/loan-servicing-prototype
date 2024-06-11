import type { Drawing } from './drawing'
import type { Participation } from './participation'
import { FacilityFee } from './strategies/facilityFee'
import { ParticipationProperties } from './strategies/participation'

export type FacilityHierarchy = 'root' | 'participation'

export type Facility = {
  streamId: string
  obligor: string
  hierarchyType: FacilityHierarchy
  participations: Participation[]
  participationsConfig: ParticipationProperties[]
  currentDate: Date
  streamVersion: number
  facilityType: string
  facilityFees: FacilityFee[]
  drawings: Drawing[]
  facilityAmount: string
  drawnAmount: string
  undrawnAmount: string
  issuedEffectiveDate: Date
  expiryDate: Date
}

export type FacilityResponseDto = Omit<
  Facility,
  'drawings' | 'participations' | 'parentFacility'
> & {
  drawings: Omit<Drawing, 'facility'>[]
  participations: Omit<FacilityResponseDto, 'participations'>[]
}

export type AdjustFacilityAmountDto = {
  effectiveDate: string
  adjustment: string
}

export type NewFacilityRequestDto = Omit<
  Facility,
  | 'streamId'
  | 'streamVersion'
  | 'drawings'
  | 'drawnAmount'
  | 'undrawnAmount'
  | 'facilityFees'
  | 'currentDate'
  | 'participations'
  | 'participationsConfig'
>
