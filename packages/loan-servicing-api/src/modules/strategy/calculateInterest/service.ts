import { Injectable } from '@nestjs/common'
import { CalculateInterestStrategyName, Facility, FacilityProjectionEvent } from 'loan-servicing-common'
import calculateInterestStrategies from './strategies'

@Injectable()
class CalculateInterestService {
  calculate(
    facility: Facility,
    strategy: CalculateInterestStrategyName,
  ): string {
    return calculateInterestStrategies[strategy](facility)
  }

  generateInterestEvents = (facility: Facility): FacilityProjectionEvent[] => {
    const expiryDate = new Date(facility.expiryDate)
    let dateToProcess = new Date(facility.issuedEffectiveDate)
    const interestEvents: FacilityProjectionEvent[] = []
    while (dateToProcess <= expiryDate) {
      interestEvents.push({
        effectiveDate: dateToProcess,
        type: 'CalculateInterest',
        eventData: {},
      })
      // Naive date management - not suitable for production
      dateToProcess = new Date(dateToProcess.getTime() + 24 * 60 * 60000)
    }
    return interestEvents
  }
}

export default CalculateInterestService
