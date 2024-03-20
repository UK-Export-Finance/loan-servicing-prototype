import Big from 'big.js'
import { add } from 'date-fns'
import {
  Drawing,
  ManualRepaymentStrategyOptions,
  RegularRepaymentStrategyOptions,
  Repayment,
  RepaymentStrategyName,
  RepaymentStrategyOptions,
} from 'loan-servicing-common'

export type GetRepaymentEventsStrategy<T extends RepaymentStrategyOptions> = (
  drawing: Drawing,
  options: T,
) => Repayment[]

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

export const getRegularRepayments: GetRepaymentEventsStrategy<
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

  const repaymentEvents = repaymentDates.map<Repayment>((date, i) => ({
    amount:
      i + 1 === repaymentDates.length
        ? finalPaymentAmount
        : regularPaymentAmount,
    date,
    id: `${drawing.streamId}-repayment-${i + 1}`,
    received: false,
  }))

  return repaymentEvents
}

export const getManualRepayments: GetRepaymentEventsStrategy<
  ManualRepaymentStrategyOptions
> = ({ streamId }, { repayments }) => {
  const repaymentEvents = repayments.map<Repayment>((r, i) => ({
    amount: r.amount,
    date: r.date,
    id: `${streamId}-repayment-${i + 1}`,
    received: false,
  }))
  return repaymentEvents
}

type RepaymentEventStrategies = {
  [K in RepaymentStrategyName]: GetRepaymentEventsStrategy<
    Extract<RepaymentStrategyOptions, { name: K }>
  >
}

export const repaymentEventStrategies: RepaymentEventStrategies = {
  Regular: getRegularRepayments,
  Manual: getManualRepayments,
}
