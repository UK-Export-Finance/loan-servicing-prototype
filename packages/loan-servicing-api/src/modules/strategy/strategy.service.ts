import { Inject } from '@nestjs/common'
import CalculateInterestService from './calculateInterest/service'
import RepaymentsService from './repayments/service'

class StrategyService {
  constructor(
    @Inject(CalculateInterestService)
    private calculateInterestService: CalculateInterestService,
    @Inject(RepaymentsService) private repaymentsService: RepaymentsService,
  ) {}

  calculateInterest = this.calculateInterestService.calculate

  getInterestEvents = this.calculateInterestService.generateInterestEvents

  getRepaymentEvents = this.repaymentsService.createRepaymentEvents

  calculateRepayment = this.repaymentsService.calculateRepayment
}

export default StrategyService
