import { Injectable } from '@nestjs/common'
import {
  FacilityProjectionEvent,
  FacilityWithSpecifiedConfig,
  RepaymentsEvent,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { repaymentEventStrategies } from './repayment-events.strategies'
import { calculateRepaymentStrategies } from './calculate-repayment.strategies'

@Injectable()
class RepaymentsService {
  createRepaymentEvents<T extends RepaymentStrategyName>(
    facility: FacilityWithSpecifiedConfig<'repaymentsStrategy', T>,
  ): RepaymentsEvent[] {
    const options = facility.facilityConfig.repaymentsStrategy
    const strategyName: T = options.name
    return repaymentEventStrategies[strategyName](facility)
  }

  calculateRepayment<T extends RepaymentStrategyName>(
    facility: FacilityWithSpecifiedConfig<'repaymentsStrategy', T>,
    event: RepaymentsEvent,
    remainingEvents: FacilityProjectionEvent[],
  ): string {
    const options = facility.facilityConfig.repaymentsStrategy
    const strategyName: T = options.name
    return calculateRepaymentStrategies[strategyName](
      facility,
      event,
      remainingEvents,
    )
  }
}

export default RepaymentsService
