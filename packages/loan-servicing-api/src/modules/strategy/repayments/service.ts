import { Injectable } from '@nestjs/common'
import { Repayment, RepaymentStrategyOptions } from 'loan-servicing-common'
import { InProgressDrawing } from 'modules/projections/builders/DrawingBuilder'
import {
  GetRepaymentEventsStrategy,
  repaymentEventStrategies,
} from './repayment-events.strategies'

@Injectable()
class RepaymentsService {
  createRepayments<T extends RepaymentStrategyOptions>(
    drawing: InProgressDrawing,
    options: T,
  ): Repayment[] {
    const generateEvents = repaymentEventStrategies[
      options.name
    ] as unknown as GetRepaymentEventsStrategy<T>
    return generateEvents(drawing, options)
  }
}

export default RepaymentsService
