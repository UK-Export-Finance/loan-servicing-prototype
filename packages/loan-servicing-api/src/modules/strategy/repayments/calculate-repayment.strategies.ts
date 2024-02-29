import Big, { roundDown } from 'big.js'
import {
  FacilityProjectionEvent,
  FacilityWithSpecifiedConfig,
  RepaymentEvent,
  RepaymentStrategyName,
} from 'loan-servicing-common'

export type CalculateRepaymentsStrategy<T extends RepaymentStrategyName> = (
  facility: FacilityWithSpecifiedConfig<'repaymentsStrategy', T>,
  event: RepaymentEvent,
  remainingEvents: FacilityProjectionEvent[],
) => string

export const calculateRegularRepayment: CalculateRepaymentsStrategy<
  'Regular'
> = (facility, event, remainingEvents) => {
  if (event.type === 'FinalRepayment') {
    return facility.facilityAmount
  }
  const principalToPay = Big(facility.facilityAmount)
  const repaymentsRemaining = remainingEvents.filter(
    (e) => e.type === 'Repayment' || e.type === 'FinalRepayment',
  ).length
  const nonFinalRepaymentAmount = principalToPay
    .div(repaymentsRemaining)
    .round(2, roundDown)
  return nonFinalRepaymentAmount.toString()
}

export const calculateManualRepayment: CalculateRepaymentsStrategy<
  'Manual'
> = () => '0'

type RepaymentEventStrategies = {
  [K in RepaymentStrategyName]: CalculateRepaymentsStrategy<K>
}

export const calculateRepaymentStrategies: RepaymentEventStrategies = {
  Regular: calculateRegularRepayment,
  Manual: calculateManualRepayment,
}
