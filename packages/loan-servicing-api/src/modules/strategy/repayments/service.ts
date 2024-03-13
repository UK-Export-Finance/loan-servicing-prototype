import { Injectable } from '@nestjs/common'
import {
  Drawing,
  ProjectedEvent,
  RepaymentsEvent,
  RepaymentStrategyOptions,
} from 'loan-servicing-common'
import {
  GetRepaymentEventsStrategy,
  repaymentEventStrategies,
} from './repayment-events.strategies'
import {
  CalculateRepaymentsStrategy,
  calculateRepaymentStrategies,
} from './calculate-repayment.strategies'

@Injectable()
class RepaymentsService {
  createRepaymentEvents<T extends RepaymentStrategyOptions>(
    drawing: Drawing,
    options: T,
  ): RepaymentsEvent[] {
    const generateEvents = repaymentEventStrategies[
      options.name
    ] as unknown as GetRepaymentEventsStrategy<T>
    return generateEvents(drawing, options)
  }

  calculateRepayment<T extends RepaymentsEvent>(
    drawing: Drawing,
    event: T,
    remainingEvents: ProjectedEvent[],
  ): string {
    const calculate = calculateRepaymentStrategies[
      event.type
    ] as CalculateRepaymentsStrategy<T>
    return calculate(drawing, event, remainingEvents)
  }
}

export default RepaymentsService
