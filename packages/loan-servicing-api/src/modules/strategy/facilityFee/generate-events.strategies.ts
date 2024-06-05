import {
  AccruingFacilityFeeStrategyOption,
  CalculateAccruingFacilityFeeEvent,
  CalculateFacilityFeeEvent,
  FacilityFeeStrategyName,
  FacilityFeeStrategyOption,
  FixedFacilityFeeStrategyOption,
} from 'loan-servicing-common'
import { ReadonlyInProgressFacility } from 'modules/projections/builders/FacilityBuilder'

export type GetFacilityFeeEventsStrategy<T extends FacilityFeeStrategyOption> =
  (facility: ReadonlyInProgressFacility, option: T) => CalculateFacilityFeeEvent[]

export const getAccruingFacilityFeeEvents: GetFacilityFeeEventsStrategy<
  AccruingFacilityFeeStrategyOption
> = (facility, option) => {
  const expiryDate = new Date(option.expiryDate)
  let dateToProcess = new Date(option.effectiveDate)

  const facilityFeeEvents: CalculateAccruingFacilityFeeEvent[] = []
  while (dateToProcess <= expiryDate) {
    facilityFeeEvents.push({
      effectiveDate: dateToProcess,
      streamId: facility.streamId,
      shouldProcessIfFuture: false,
      entityType: 'facility',
      type: 'CalculateAccruingFacilityFee',
      eventData: option,
      isApproved: false,
    })
    // Naive date management - not suitable for production
    dateToProcess = new Date(dateToProcess.getTime() + 24 * 60 * 60000)
  }
  return facilityFeeEvents
}

export const getFixedFacilityFeeEvents: GetFacilityFeeEventsStrategy<
  FixedFacilityFeeStrategyOption
> = (facility, option) => [
  {
    effectiveDate: option.effectiveDate,
    streamId: facility.streamId,
    shouldProcessIfFuture: false,
    entityType: 'facility',
    type: 'CalculateFixedFacilityFee',
    eventData: option,
      isApproved: false,
  },
]

type FacilityFeeEventStrategies = {
  [K in FacilityFeeStrategyName]: GetFacilityFeeEventsStrategy<
    Extract<FacilityFeeStrategyOption, { name: K }>
  >
}

export const facilityFeeEventStrategies: FacilityFeeEventStrategies = {
  AccruingFacilityFee: getAccruingFacilityFeeEvents,
  FixedFacilityFee: getFixedFacilityFeeEvents,
}
