import { Inject } from '@nestjs/common'
import { Facility } from 'loan-servicing-common'
import CalculateInterestService from './calculateInterest/service'
import { CalculateInterestStrategyName } from './calculateInterest/strategies'

export type FacilityContextOptions = {
  calculateInterestStrategy: CalculateInterestStrategyName
}

class StrategyService {
  constructor(
    @Inject(CalculateInterestService)
    private calculateInterestService: CalculateInterestService,
  ) {}

  calculateInterest(
    { calculateInterestStrategy }: FacilityContextOptions,
    facility: Facility,
  ): string {
    this.calculateInterestService.setStrategy(calculateInterestStrategy)
    return this.calculateInterestService.calculate(facility)
  }
}

export default StrategyService
