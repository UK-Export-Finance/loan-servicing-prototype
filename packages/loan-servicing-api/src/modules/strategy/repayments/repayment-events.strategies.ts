import { add } from 'date-fns'
import {
  Drawing,
  ManualRepaymentEvent,
  ManualRepaymentStrategyOptions,
  RegularRepaymentEvent,
  RegularRepaymentStrategyOptions,
  RepaymentsEvent,
  RepaymentStrategyName,
  RepaymentStrategyOptions,
} from 'loan-servicing-common'

export type GetRepaymentEventsStrategy<T extends RepaymentStrategyOptions> = (
  drawing: Drawing,
  options: T,
) => Extract<RepaymentsEvent, { type: `${T['name']}Repayment` }>[]

export const getRegularRepaymentEvents: GetRepaymentEventsStrategy<
  RegularRepaymentStrategyOptions
> = ({ expiryDate, streamId }, { startDate, monthsBetweenRepayments }) => {
  let dateToProcess = new Date(startDate)
  const repaymentDates: Date[] = []

  while (dateToProcess <= new Date(expiryDate)) {
    repaymentDates.push(dateToProcess)
    dateToProcess = add(dateToProcess, {
      months: Number(monthsBetweenRepayments),
    })
  }
  const repaymentEvents = repaymentDates.map<RegularRepaymentEvent>(
    (date, i) => ({
      effectiveDate: date,
      type: 'RegularRepayment',
      shouldProcessIfFuture: false,
      streamId,
      entityType: 'drawing',
      eventData: {
        totalRepayments: repaymentDates.length,
        repaymentNumber: i + 1,
      },
    }),
  )

  return repaymentEvents
}

export const getManualRepaymentEvents: GetRepaymentEventsStrategy<
  ManualRepaymentStrategyOptions
> = ({ streamId }, { repayments }) => {
  const repaymentEvents = repayments.map<ManualRepaymentEvent>((r) => ({
    effectiveDate: r.date,
    type: 'ManualRepayment',
    shouldProcessIfFuture: false,
    streamId,
    entityType: 'drawing',
    eventData: { amount: r.amount },
  }))
  return repaymentEvents
}

type RepaymentEventStrategies = {
  [K in RepaymentStrategyName]: GetRepaymentEventsStrategy<
    Extract<RepaymentStrategyOptions, { name: K }>
  >
}

export const repaymentEventStrategies: RepaymentEventStrategies = {
  Regular: getRegularRepaymentEvents,
  Manual: getManualRepaymentEvents,
}
