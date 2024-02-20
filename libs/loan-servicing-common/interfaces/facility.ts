export type Facility = {
  streamId: string
  streamVersion: number
  obligor: string
  //   facilityType: string
  //   description: string
  //   currency: string
  facilityAmount: number
  interestRate: number
  //   commitmentDate: Date
  //   issuedNotEffectiveDate: Date
  issuedEffectiveDate: Date
  //   availabilityDate: Date
  expiryDate: Date
  //   usedAmount: number
  //   availableAmount: number
}

export type NewFacilityRequestDto = Omit<
  Facility,
  'streamId' | 'streamVersion'
>

export type UpdateFacilityRequestDto = Partial<NewFacilityRequestDto>
