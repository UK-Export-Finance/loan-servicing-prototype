import { Inject, Injectable, Scope } from '@nestjs/common'
import CalculateInterestService from './calculateInterest/service'
import RepaymentsService from './repayments/service'
import { CalculateInterestStrategy } from './calculateInterest/strategies'

@Injectable({ scope: Scope.REQUEST })
class StrategyService {
  constructor(
    @Inject(CalculateInterestService)
    private calculateInterestService: CalculateInterestService,
    @Inject(RepaymentsService) private repaymentsService: RepaymentsService,
  ) {}

  calculateInterest: CalculateInterestStrategy = (facility) =>
    this.calculateInterestService.calculate(
      facility,
      facility.facilityConfig.calculateInterestStrategy,
    )

  getInterestEvents = this.calculateInterestService.generateInterestEvents

  getRepaymentEvents = this.repaymentsService.createRepaymentEvents

  calculateRepayment = this.repaymentsService.calculateRepayment
}

export default StrategyService
