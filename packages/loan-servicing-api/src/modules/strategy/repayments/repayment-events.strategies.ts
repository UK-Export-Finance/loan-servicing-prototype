import { add } from 'date-fns'
import {
  DrawingWithSpecifiedConfig,
  RepaymentsEvent,
  RepaymentStrategyName,
} from 'loan-servicing-common'

export type GetRepaymentEventsStrategy<T extends RepaymentStrategyName> = (
  facility: DrawingWithSpecifiedConfig<'repaymentsStrategy', T>,
) => RepaymentsEvent[]

export const getRegularRepaymentEvents: GetRepaymentEventsStrategy<
  'Regular'
> = ({
  expiryDate,
  drawingConfig: {
    repaymentsStrategy: { startDate, monthsBetweenRepayments },
  },
}) => {
  let dateToProcess = new Date(startDate)
  const repaymentDates: Date[] = []

  while (dateToProcess <= new Date(expiryDate)) {
    repaymentDates.push(dateToProcess)
    dateToProcess = add(dateToProcess, {
      months: Number(monthsBetweenRepayments),
    })
  }
  const repaymentEvents = repaymentDates.map<RepaymentsEvent>((date, i) => ({
    effectiveDate: date,
    type: 'Repayment',
    eventData: {
      totalRepayments: repaymentDates.length,
      repaymentNumber: i + 1,
    },
  }))

  repaymentEvents[repaymentEvents.length - 1].type = 'FinalRepayment'

  return repaymentEvents
}

export const getManualRepaymentEvents: GetRepaymentEventsStrategy<'Manual'> = ({
  drawingConfig: {
    repaymentsStrategy: { repayments },
  },
}) => {
  const repaymentEvents = repayments.map<RepaymentsEvent>((r, i) => ({
    effectiveDate: r.date,
    type: 'Repayment',
    eventData: { totalRepayments: repayments.length, repaymentNumber: i + 1 },
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
