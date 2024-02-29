import { Injectable } from '@nestjs/common'
import Big, { roundDown } from 'big.js'
import {
  Facility,
  FacilityProjectionEvent,
  FacilityWithSpecifiedConfig,
  RepaymentEvent,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { repaymentEventStrategies } from './strategies'

@Injectable()
class RepaymentsService {
  createRepaymentEvents<T extends RepaymentStrategyName>(
    facility: FacilityWithSpecifiedConfig<'repaymentsStrategy', T>,
  ): RepaymentEvent[] {
    const options = facility.facilityConfig.repaymentsStrategy
    // Needed to get the typing correct
    // eslint-disable-next-line prefer-destructuring
    const name: T = options.name
    return repaymentEventStrategies[name](facility, options)
  }

  calculateRepayment(
    facility: Facility,
    event: RepaymentEvent,
    remainingEvents: FacilityProjectionEvent[],
  ): string {
    if (event.type === 'FinalRepayment') {
      return facility.facilityAmount
    }
    const principalToPay = Big(facility.facilityAmount)
    const repaymentsRemaining = remainingEvents.filter(
      (e) => e.type === 'Repayment' || e.type === 'FinalRepayment',
    ).length
    const nonFinalRepaymentAmount = principalToPay
      .div(repaymentsRemaining)
      .round(2, roundDown)
    return nonFinalRepaymentAmount.toString()
  }
}

export default RepaymentsService
