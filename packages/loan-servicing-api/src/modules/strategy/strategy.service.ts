import { Inject, Injectable, Scope } from '@nestjs/common'
import { Facility } from 'loan-servicing-common'
import CalculateInterestService from './calculateInterest/service'
import StrategyOptionsProvider, {
  FacilityStrategyOptions,
} from './strategyOptions.provider'

@Injectable({ scope: Scope.REQUEST })
class StrategyService {
  constructor(
    @Inject(StrategyOptionsProvider)
    private strategyOptions: FacilityStrategyOptions,
    @Inject(CalculateInterestService)
    private calculateInterestService: CalculateInterestService,
  ) {}

  calculateInterest(facility: Facility): string {
    this.calculateInterestService.setStrategy(
      this.strategyOptions.calculateInterestStrategy,
    )
    return this.calculateInterestService.calculate(facility)
  }
}

export default StrategyService
