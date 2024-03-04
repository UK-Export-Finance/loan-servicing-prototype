import { Drawing } from "./drawing"

export type Facility = {
  streamId: string
  obligor: string
  streamVersion: number
  facilityType: string
  drawings: Drawing[]
  facilityAmount: string
  issuedEffectiveDate: Date
  expiryDate: Date
}
export type AdjustFacilityAmountDto = {
  effectiveDate: string
  adjustment: string
}

export type NewFacilityRequestDto = Omit<
  Facility, 'streamId' | 'streamVersion'
>

