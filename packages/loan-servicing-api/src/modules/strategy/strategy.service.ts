import { Inject, Injectable, Scope } from '@nestjs/common'
import { Facility, FacilityStrategyOptions } from 'loan-servicing-common'
import CalculateInterestService from './calculateInterest/service'
import StrategyOptionsProvider from './strategyOptions.provider'

@Injectable({ scope: Scope.REQUEST })
class StrategyService {
  constructor(
    @Inject(StrategyOptionsProvider)
    private strategyOptions: FacilityStrategyOptions,
    @Inject(CalculateInterestService)
    private calculateInterestService: CalculateInterestService,
  ) {}

  calculateInterest = (facility: Facility): string =>
    this.calculateInterestService.calculate(
      facility,
      this.strategyOptions.calculateInterestStrategy,
    )

  getInterestEvents = this.calculateInterestService.generateInterestEvents
}

export default StrategyService
