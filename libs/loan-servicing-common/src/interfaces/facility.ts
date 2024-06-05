import { ReplaceProperty } from '../utils/type-utils'
import type { Drawing } from './drawing'
import { FacilityFee } from './strategies/facilityFee'

export type FacilityHierarchy = 'root' | 'participation'

export type Facility = {
  streamId: string
  obligor: string
  hierarchyType: FacilityHierarchy
  parentFacility?: Facility
  participations: Facility[]
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

export type FacilityResponseDto = ReplaceProperty<
  Facility,
  'drawings',
  Omit<Drawing, 'facility'>[]
>

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
