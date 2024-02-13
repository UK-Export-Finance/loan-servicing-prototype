interface BaseEvent {
    type: string
    typeVersion: number
}

export type FacilityCreatedEvent = {
    type: 'FacilityCreated'
    typeVersion: 1
    obligor: string
    // facilityType: string
    // description: string
    // currency: string
    // facilityAmount: number
    // commitmentDate: Date
    // issuedNotEffectiveDate: Date
    // issuedEffectiveDate: Date
    // availabilityDate: Date
    // expiryDate: Date
    // usedAmount: number
    // availableAmount: number
} & BaseEvent

export default BaseEvent