import { Inject, Injectable, Scope } from '@nestjs/common'
import { FacilityStrategyOptions } from 'loan-servicing-common'
import CalculateInterestService from './calculateInterest/service'
import StrategyOptionsProvider from './strategyOptions.provider'
import RepaymentsService from './repayments/service'
import { CalculateInterestStrategy } from './calculateInterest/strategies'

@Injectable({ scope: Scope.REQUEST })
class StrategyService {
  constructor(
    @Inject(StrategyOptionsProvider)
    private strategyOptions: FacilityStrategyOptions,
    @Inject(CalculateInterestService)
    private calculateInterestService: CalculateInterestService,
    @Inject(RepaymentsService) private repaymentsService: RepaymentsService,
  ) {}

  calculateInterest: CalculateInterestStrategy = (facility) =>
    this.calculateInterestService.calculate(
      facility,
      this.strategyOptions.calculateInterestStrategy,
    )

  getInterestEvents = this.calculateInterestService.generateInterestEvents

  getRepaymentEvents = this.repaymentsService.createRepaymentEvents

  calculateRepayment = this.repaymentsService.calculateRepayment
}

export default StrategyService
