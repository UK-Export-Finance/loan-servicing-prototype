import { Injectable } from '@nestjs/common'
import { Facility } from 'loan-servicing-common'
import calculateInterestStrategies, {
  CalculateInterestStrategy,
  CalculateInterestStrategyName,
} from './strategies'

@Injectable()
class CalculateInterestService {
  private strategy?: CalculateInterestStrategy

  public setStrategy(strategy: CalculateInterestStrategyName): void {
    this.strategy = calculateInterestStrategies[strategy]
  }

  public calculate(facility: Facility): string {
    if (!this.strategy) {
      throw new Error('No strategy set')
    }
    return this.strategy(facility)
  }
}

export default CalculateInterestService
