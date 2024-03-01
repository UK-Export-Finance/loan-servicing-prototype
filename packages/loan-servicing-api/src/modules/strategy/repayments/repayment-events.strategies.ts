import { add } from 'date-fns'
import {
  FacilityWithSpecifiedConfig,
  RepaymentsEvent,
  RepaymentStrategyName,
} from 'loan-servicing-common'

export type GetRepaymentEventsStrategy<T extends RepaymentStrategyName> = (
  facility: FacilityWithSpecifiedConfig<'repaymentsStrategy', T>,
) => RepaymentsEvent[]

export const getRegularRepaymentEvents: GetRepaymentEventsStrategy<
  'Regular'
> = ({
  expiryDate,
  facilityConfig: {
    repaymentsStrategy: { startDate, monthsBetweenRepayments },
  },
}) => {
  let dateToProcess = new Date(startDate)
  const repaymentEvents: RepaymentsEvent[] = []

  while (dateToProcess <= new Date(expiryDate)) {
    repaymentEvents.push({
      effectiveDate: dateToProcess,
      type: 'Repayment',
      eventData: { totalRepayments: 0, repaymentNumber: 0 },
    })
    dateToProcess = add(dateToProcess, {
      months: Number(monthsBetweenRepayments),
    })
  }
  repaymentEvents[repaymentEvents.length - 1].type = 'FinalRepayment'

  return repaymentEvents.map((e, i) => ({
    ...e,
    totalRepayments: repaymentEvents.length,
    repaymentNumber: i + 1,
  }))
}

export const getManualRepaymentEvents: GetRepaymentEventsStrategy<'Manual'> = ({
  facilityConfig: {
    repaymentsStrategy: { repayments },
  },
}) => {
  const repaymentEvents = repayments.map<RepaymentsEvent>((r, i) => ({
    effectiveDate: r.date,
    type: 'Repayment',
    eventData: { totalRepayments: repayments.length, repaymentNumber: i +1 },
  }))
  repaymentEvents[repaymentEvents.length - 1].type = 'FinalRepayment'
  return repaymentEvents
}

type RepaymentEventStrategies = {
  [K in RepaymentStrategyName]: GetRepaymentEventsStrategy<K>
}

export const repaymentEventStrategies: RepaymentEventStrategies = {
  Regular: getRegularRepaymentEvents,
  Manual: getManualRepaymentEvents,
}
