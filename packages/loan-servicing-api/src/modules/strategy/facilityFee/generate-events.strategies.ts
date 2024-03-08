import {
  CalculateAccruingFacilityFeeEvent,
  CalculateFacilityFeeEvent,
  FacilityFeeStrategyName,
  FacilityWithSpecifiedConfig,
} from 'loan-servicing-common'

export type GetFacilityFeeEventsStrategy<T extends FacilityFeeStrategyName> = (
  facility: FacilityWithSpecifiedConfig<'facilityFeeStrategy', T>,
) => CalculateFacilityFeeEvent[]

export const getAccruingFacilityFeeEvents: GetFacilityFeeEventsStrategy<
  'AccruingFacilityFee'
> = (facility) => {
  const expiryDate = new Date(facility.expiryDate)
  let dateToProcess = new Date(facility.issuedEffectiveDate)
  const facilityFeeEvents: CalculateAccruingFacilityFeeEvent[] = []
  while (dateToProcess <= expiryDate) {
    facilityFeeEvents.push({
      effectiveDate: dateToProcess,
      streamId: facility.streamId,
      entityType: 'facility',
      type: 'CalculateAccruingFacilityFee',
      eventData: facility.facilityConfig.facilityFeeStrategy,
    })
    // Naive date management - not suitable for production
    dateToProcess = new Date(dateToProcess.getTime() + 24 * 60 * 60000)
  }
  return facilityFeeEvents
}

export const getFixedFacilityFeeEvents: GetFacilityFeeEventsStrategy<
  'FixedFacilityFee'
> = (facility) => [
    {
      effectiveDate: facility.facilityConfig.facilityFeeStrategy.date,
      streamId: facility.streamId,
      entityType: 'facility',
      type: 'CalculateFixedFacilityFee',
      eventData: facility.facilityConfig.facilityFeeStrategy,
    },
  ]

type FacilityFeeEventStrategies = {
  [K in FacilityFeeStrategyName]: GetFacilityFeeEventsStrategy<K>
}

export const facilityFeeEventStrategies: FacilityFeeEventStrategies = {
  AccruingFacilityFee: getAccruingFacilityFeeEvents,
  FixedFacilityFee: getFixedFacilityFeeEvents,
}
