export type Facility = {
  streamId: string
  obligor: string
  //   facilityType: string
  //   description: string
  //   currency: string
  //   facilityAmount: number
  //   commitmentDate: Date
  //   issuedNotEffectiveDate: Date
  //   issuedEffectiveDate: Date
  //   availabilityDate: Date
  //   expiryDate: Date
  //   usedAmount: number
  //   availableAmount: number
}

export type NewFacilityRequestDto = Omit<Facility, 'streamId'>
