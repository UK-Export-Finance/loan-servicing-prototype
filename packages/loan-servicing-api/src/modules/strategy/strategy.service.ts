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
    return this.calculateInterestService.calculate(
      facility,
      this.strategyOptions.calculateInterestStrategy,
    )
  }
}

export default StrategyService
