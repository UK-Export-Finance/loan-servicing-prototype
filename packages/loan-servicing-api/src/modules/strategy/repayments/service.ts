import { Injectable } from '@nestjs/common'
import {
  Drawing,
  Repayment,
  RepaymentStrategyOptions,
} from 'loan-servicing-common'
import {
  GetRepaymentEventsStrategy,
  repaymentEventStrategies,
} from './repayment-events.strategies'

@Injectable()
class RepaymentsService {
  createRepayments<T extends RepaymentStrategyOptions>(
    drawing: Drawing,
    options: T,
  ): Repayment[] {
    const generateEvents = repaymentEventStrategies[
      options.name
    ] as unknown as GetRepaymentEventsStrategy<T>
    return generateEvents(drawing, options)
  }
}

export default RepaymentsService
