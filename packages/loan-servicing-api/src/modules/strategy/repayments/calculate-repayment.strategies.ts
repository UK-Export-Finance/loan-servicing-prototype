import { Drawing, ProjectedEvent, RepaymentsEvent } from 'loan-servicing-common'

export type CalculateRepaymentsStrategy<T extends RepaymentsEvent> = (
  drawing: Drawing,
  event: T,
  remainingEvents: ProjectedEvent[],
) => string

export const calculateManualRepayment: CalculateRepaymentsStrategy<
  RepaymentsEvent
> = (_, event) => event.eventData.amount

type RepaymentEventStrategies = {
  [K in RepaymentsEvent['type']]: CalculateRepaymentsStrategy<
    Extract<RepaymentsEvent, { type: K }>
  >
}

export const calculateRepaymentStrategies: RepaymentEventStrategies = {
  ManualRepayment: calculateManualRepayment,
}
