import { ConvertToDtoType } from '../utils/type-utils'
import { FacilityConfiguration } from './facilityConfiguration'

export type Facility = {
  streamId: string
  streamVersion: number
  obligor: string
  facilityType: string
  facilityConfig: FacilityConfiguration
  //   description: string
  //   currency: string
  facilityAmount: string
  interestAccrued: string
  interestRate: string
  //   commitmentDate: Date
  //   issuedNotEffectiveDate: Date
  issuedEffectiveDate: Date
  //   availabilityDate: Date
  expiryDate: Date
  //   usedAmount: number
  //   availableAmount: number
}

export type FacilityDto = ConvertToDtoType<Facility>

export type NewFacilityRequestDto = Omit<
  Facility,
  'streamId' | 'streamVersion' | 'interestAccrued'
>

export type UpdateInterestRequestDto = {
  effectiveDate: string
  interestRate: string
}

export type AdjustFacilityPrincipalDto = {
  effectiveDate: string
  adjustment: string
}
