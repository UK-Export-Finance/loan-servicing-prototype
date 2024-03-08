import { ReplaceProperty } from '../utils/type-utils'
import type { Drawing } from './drawing'

export type Facility = {
  streamId: string
  obligor: string
  streamVersion: number
  facilityType: string
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
  'streamId' | 'streamVersion' | 'drawings' | 'drawnAmount' | 'undrawnAmount'
>
