import { add } from 'date-fns'
import {
  FacilityWithSpecifiedConfig,
  RepaymentEvent,
  RepaymentStrategyName,
} from 'loan-servicing-common'

export type GetRepaymentEventsStrategy<T extends RepaymentStrategyName> = (
  facility: FacilityWithSpecifiedConfig<'repaymentsStrategy', T>,
) => RepaymentEvent[]

export const getRegularRepaymentEvents: GetRepaymentEventsStrategy<
  'Regular'
> = (facility) => {
  const { startDate, monthsBetweenRepayments } =
    facility.facilityConfig.repaymentsStrategy
  const expiryDate = new Date(facility.expiryDate)
  let dateToProcess = new Date(startDate)
  const repaymentEvents: RepaymentEvent[] = []
  while (dateToProcess <= expiryDate) {
    repaymentEvents.push({
      effectiveDate: dateToProcess,
      type: 'Repayment',
      eventData: { totalRepayments: 0 },
    })
    dateToProcess = add(dateToProcess, { months: monthsBetweenRepayments })
  }
  repaymentEvents[repaymentEvents.length - 1].type = 'FinalRepayment'

  return repaymentEvents.map((e) => ({
    ...e,
    totalRepayments: repaymentEvents.length,
  }))
}

export const getManualRepaymentEvents: GetRepaymentEventsStrategy<
  'Manual'
> = () => []

type RepaymentEventStrategies = {
  [K in RepaymentStrategyName]: GetRepaymentEventsStrategy<K>
}

export const repaymentEventStrategies: RepaymentEventStrategies = {
  Regular: getRegularRepaymentEvents,
  Manual: getManualRepaymentEvents,
}
