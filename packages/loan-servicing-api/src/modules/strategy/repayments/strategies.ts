import { add } from 'date-fns'
import {
  Facility,
  ManualRepaymentStrategyOptions,
  RegularRepaymentStrategyOptions,
  RepaymentEvent,
  RepaymentStrategyOptions,
} from 'loan-servicing-common'
import { StrategyLookup } from 'modules/utils/strategies'

export type GetRepaymentEventsStrategy<T extends RepaymentStrategyOptions> = (
  facility: Facility,
  strategyOptions: T,
) => RepaymentEvent[]

export const getRegularRepaymentEvents: GetRepaymentEventsStrategy<
  RegularRepaymentStrategyOptions
> = (facility, { startDate, monthsBetweenRepayments }) => {
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
  ManualRepaymentStrategyOptions
> = () => []

export const repaymentEventStrategies: StrategyLookup<
  'repaymentsStrategy',
  RepaymentEvent[]
> = {
  Regular: getRegularRepaymentEvents,
  Manual: getManualRepaymentEvents,
}
