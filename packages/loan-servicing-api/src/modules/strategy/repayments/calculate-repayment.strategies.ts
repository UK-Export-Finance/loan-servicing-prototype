import Big, { roundDown } from 'big.js'
import {
  Drawing,
  ManualRepaymentEvent,
  ProjectedEvent,
  RegularRepaymentEvent,
  RepaymentsEvent,
} from 'loan-servicing-common'

export type CalculateRepaymentsStrategy<T extends RepaymentsEvent> = (
  drawing: Drawing,
  event: T,
  remainingEvents: ProjectedEvent[],
) => string

export const calculateRegularRepayment: CalculateRepaymentsStrategy<
  RegularRepaymentEvent
> = (drawing, event) => {
  const principalToPay = Big(drawing.outstandingPrincipal)
  const repaymentsRemaining =
    event.eventData.totalRepayments - event.eventData.repaymentNumber
  if (repaymentsRemaining === 0) {
    return principalToPay.toFixed(2)
  }
  const nonFinalRepaymentAmount = principalToPay
    .div(repaymentsRemaining)
    .round(2, roundDown)
  return nonFinalRepaymentAmount.toString()
}

export const calculateManualRepayment: CalculateRepaymentsStrategy<
  ManualRepaymentEvent
> = (_, event) => event.eventData.amount

type RepaymentEventStrategies = {
  [K in RepaymentsEvent['type']]: CalculateRepaymentsStrategy<
    Extract<RepaymentsEvent, { type: K }>
  >
}

export const calculateRepaymentStrategies: RepaymentEventStrategies = {
  RegularRepayment: calculateRegularRepayment,
  ManualRepayment: calculateManualRepayment,
}
