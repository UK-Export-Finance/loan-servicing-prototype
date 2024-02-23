import { Injectable } from '@nestjs/common'
import { Facility } from 'loan-servicing-common'
import calculateInterestStrategies, {
  CalculateInterestStrategyName,
} from './strategies'

@Injectable()
class CalculateInterestService {
  public calculate(facility: Facility, strategy: CalculateInterestStrategyName): string {
    return calculateInterestStrategies[strategy](facility)
  }
}

export default CalculateInterestService
