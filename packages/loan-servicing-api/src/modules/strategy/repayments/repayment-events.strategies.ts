import Big from 'big.js'
import { add } from 'date-fns'
import {
  Drawing,
  ManualRepaymentStrategyOptions,
  RegularRepaymentStrategyOptions,
  RepaymentStrategyName,
  RepaymentStrategyOptions,
  RepaymentsEvent,
} from 'loan-servicing-common'

export type GetRepaymentEventsStrategy<T extends RepaymentStrategyOptions> = (
  drawing: Drawing,
  options: T,
) => RepaymentsEvent[]

const calculateRegularRepaymentAmounts = (
  drawing: Drawing,
  numberOfRepayments: number,
): {
  regularPaymentAmount: string
  finalPaymentAmount: string
} => {
  const principalToPay = Big(drawing.outstandingPrincipal)
  const nonFinalPaymentAmount = principalToPay.div(numberOfRepayments).round(2)
  const finalPaymentAmount = principalToPay.minus(
    nonFinalPaymentAmount.times(numberOfRepayments - 1),
  )
  return {
    regularPaymentAmount: nonFinalPaymentAmount.toFixed(2),
    finalPaymentAmount: finalPaymentAmount.toFixed(2),
  }
}

export const getRegularRepaymentEvents: GetRepaymentEventsStrategy<
  RegularRepaymentStrategyOptions
> = (drawing, { startDate, monthsBetweenRepayments }) => {
  let dateToProcess = new Date(startDate)
  const repaymentDates: Date[] = []

  while (dateToProcess <= new Date(drawing.expiryDate)) {
    repaymentDates.push(dateToProcess)
    dateToProcess = add(dateToProcess, {
      months: Number(monthsBetweenRepayments),
    })
  }
  const { regularPaymentAmount, finalPaymentAmount } =
    calculateRegularRepaymentAmounts(drawing, repaymentDates.length)

  const repaymentEvents = repaymentDates.map<RepaymentsEvent>((date, i) => ({
    effectiveDate: date,
    type: 'ManualRepayment',
    shouldProcessIfFuture: false,
    streamId: drawing.streamId,
    entityType: 'drawing',
    eventData: {
      amount:
        i + 1 === repaymentDates.length
          ? finalPaymentAmount
          : regularPaymentAmount,
    },
  }))

  return repaymentEvents
}

export const getManualRepaymentEvents: GetRepaymentEventsStrategy<
  ManualRepaymentStrategyOptions
> = ({ streamId }, { repayments }) => {
  const repaymentEvents = repayments.map<RepaymentsEvent>((r) => ({
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
