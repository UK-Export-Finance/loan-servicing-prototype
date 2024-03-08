import {
  CalculateFacilityFeeEvent,
  Facility,
  CalculateAccruingFacilityFeeEvent,
  CalculateFixedFacilityFeeEvent,
} from 'loan-servicing-common'
import { calculateAccrual } from 'maths/accrualCalculations'

export type CalculateFacilityFeeStrategy<T extends CalculateFacilityFeeEvent> =
  (facility: Facility, event: T) => string

export const calculateAccruingFacilityFee: CalculateFacilityFeeStrategy<
  CalculateAccruingFacilityFeeEvent
> = (facility, { eventData: { accrualRate, accruesOn } }) =>
  calculateAccrual(facility[accruesOn], accrualRate)

export const calculateFixedFacilityFee: CalculateFacilityFeeStrategy<
  CalculateFixedFacilityFeeEvent
> = (_, { eventData: { feeAmount } }) => feeAmount

type CaclulateFacilityFeeEventHandlers = {
  [K in CalculateFacilityFeeEvent['type']]: CalculateFacilityFeeStrategy<
    Extract<CalculateFacilityFeeEvent, { type: K }>
  >
}

const calculateFacilityFeeStrategies: CaclulateFacilityFeeEventHandlers = {
  CalculateAccruingFacilityFee: calculateAccruingFacilityFee,
  CalculateFixedFacilityFee: calculateFixedFacilityFee,
}

export default calculateFacilityFeeStrategies
