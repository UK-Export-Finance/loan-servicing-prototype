import { Injectable } from '@nestjs/common'
import Big, { roundDown } from 'big.js'
import { add } from 'date-fns'
import {
  Facility,
  FacilityProjectionEvent,
  RepaymentEvent,
} from 'loan-servicing-common'

@Injectable()
class RepaymentsService {
  createRepaymentEvents(
    facility: Facility,
    monthsWithoutRepayment: number,
    monthsBetweenRepayments: number,
  ): RepaymentEvent[] {
    const expiryDate = new Date(facility.expiryDate)
    let dateToProcess = add(new Date(facility.issuedEffectiveDate), {
      months: monthsWithoutRepayment,
    })
    const repaymentEvents: RepaymentEvent[] = []
    while (dateToProcess <= expiryDate) {
      repaymentEvents.push({
        effectiveDate: dateToProcess,
        type: 'Repayment',
        eventData: { totalRepayments: 0 },
      })
      dateToProcess = add(dateToProcess, { months: monthsBetweenRepayments })
    }
    repaymentEvents[repaymentEvents.length - 1].type = 'FinalRepayment'

    return repaymentEvents.map((e) => ({
      ...e,
      totalRepayments: repaymentEvents.length,
    }))
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
