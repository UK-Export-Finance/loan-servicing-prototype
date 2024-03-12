import {
  AccruingFacilityFeeStrategyOption,
  CalculateAccruingFacilityFeeEvent,
  CalculateFacilityFeeEvent,
  Facility,
  FacilityFeeStrategyName,
  FacilityFeeStrategyOption,
  FixedFacilityFeeStrategyOption,
} from 'loan-servicing-common'

export type GetFacilityFeeEventsStrategy<T extends FacilityFeeStrategyOption> =
  (facility: Facility, option: T) => CalculateFacilityFeeEvent[]

export const getAccruingFacilityFeeEvents: GetFacilityFeeEventsStrategy<
  AccruingFacilityFeeStrategyOption
> = (facility, option) => {
  const expiryDate = new Date(facility.expiryDate)
  let dateToProcess = new Date(facility.issuedEffectiveDate)
  const feeId = crypto.randomUUID()

  const facilityFeeEvents: CalculateAccruingFacilityFeeEvent[] = []
  while (dateToProcess <= expiryDate) {
    facilityFeeEvents.push({
      effectiveDate: dateToProcess,
      streamId: facility.streamId,
      entityType: 'facility',
      type: 'CalculateAccruingFacilityFee',
      eventData: { ...option, feeId },
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
    effectiveDate: option.date,
    streamId: facility.streamId,
    entityType: 'facility',
    type: 'CalculateFixedFacilityFee',
    eventData: { ...option, feeId: crypto.randomUUID() },
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
