import { Injectable } from '@nestjs/common'
import {
  CalculateInterestStrategyName,
  Drawing,
  DrawingProjectedEvent,
  DrawingWithSpecifiedConfig,
} from 'loan-servicing-common'
import calculateInterestStrategies from './strategies'

@Injectable()
class CalculateInterestService {
  calculate<T extends CalculateInterestStrategyName>(
    drawing: DrawingWithSpecifiedConfig<'calculateInterestStrategy', T>,
  ): string {
    const option = drawing.drawingConfig.calculateInterestStrategy
    const strategyName: T = option.name
    return calculateInterestStrategies[strategyName](drawing)
  }

  generateInterestEvents = (drawing: Drawing): DrawingProjectedEvent[] => {
    const expiryDate = new Date(drawing.expiryDate)
    let dateToProcess = new Date(drawing.issuedEffectiveDate)
    const interestEvents: DrawingProjectedEvent[] = []
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
