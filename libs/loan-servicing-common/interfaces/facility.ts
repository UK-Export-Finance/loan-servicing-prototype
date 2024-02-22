import { ConvertToDtoType } from '../utils/type-utils'

export type Facility = {
  streamId: string
  streamVersion: number
  obligor: string
  //   facilityType: string
  //   description: string
  //   currency: string
  facilityAmount: string
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

export type NewFacilityRequestDto = Omit<Facility, 'streamId' | 'streamVersion'>

export type UpdateInterestRequestDto = { newInterestRate: string }

export type AdjustFacilityPrincipalDto = {
  effectiveDate: string
  adjustment: string
}
