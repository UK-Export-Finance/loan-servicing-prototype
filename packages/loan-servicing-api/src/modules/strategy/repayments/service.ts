import { Injectable } from '@nestjs/common'
import {
  DrawingProjectionEvent,
  DrawingWithSpecifiedConfig,
  RepaymentsEvent,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { repaymentEventStrategies } from './repayment-events.strategies'
import { calculateRepaymentStrategies } from './calculate-repayment.strategies'

@Injectable()
class RepaymentsService {
  createRepaymentEvents<T extends RepaymentStrategyName>(
    drawing: DrawingWithSpecifiedConfig<'repaymentsStrategy', T>,
  ): RepaymentsEvent[] {
    const options = drawing.drawingConfig.repaymentsStrategy
    const strategyName: T = options.name
    return repaymentEventStrategies[strategyName](drawing)
  }

  calculateRepayment<T extends RepaymentStrategyName>(
    drawing: DrawingWithSpecifiedConfig<'repaymentsStrategy', T>,
    event: RepaymentsEvent,
    remainingEvents: DrawingProjectionEvent[],
  ): string {
    const options = drawing.drawingConfig.repaymentsStrategy
    const strategyName: T = options.name
    return calculateRepaymentStrategies[strategyName](
      drawing,
      event,
      remainingEvents,
    )
  }
}

export default RepaymentsService
