import type { Drawing } from './drawing'
import { FacilityFee } from './strategies/facilityFee'
import { ParticpationProperties } from './strategies/participation'

export type FacilityHierarchy = 'root' | 'participation'

export type Facility = {
  streamId: string
  obligor: string
  hierarchyType: FacilityHierarchy
  parentFacility?: Facility
  participations: Facility[]
  participationsConfig: ParticpationProperties[]
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
  parentFacility?: FacilityResponseDto
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
  | 'hierarchyType'
  | 'participations'
>
