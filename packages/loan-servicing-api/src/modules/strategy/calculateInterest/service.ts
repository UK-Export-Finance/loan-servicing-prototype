import { Injectable } from '@nestjs/common'
import { CalculateInterestStrategyName, Facility } from 'loan-servicing-common'
import calculateInterestStrategies from './strategies'

@Injectable()
class CalculateInterestService {
  public calculate(
    facility: Facility,
    strategy: CalculateInterestStrategyName,
  ): string {
    return calculateInterestStrategies[strategy](facility)
  }
}

export default CalculateInterestService
