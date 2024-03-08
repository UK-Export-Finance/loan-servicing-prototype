import { Inject } from '@nestjs/common'
import CalculateInterestService from './calculateInterest/service'
import RepaymentsService from './repayments/service'
import FacilityFeeService from './facilityFee/service'

class StrategyService {
  constructor(
    @Inject(CalculateInterestService)
    private calculateInterestService: CalculateInterestService,
    @Inject(RepaymentsService) private repaymentsService: RepaymentsService,
    @Inject(FacilityFeeService) private facilityFeeService: FacilityFeeService,
  ) {}

  calculateInterest = this.calculateInterestService.calculate

  getInterestEvents = this.calculateInterestService.generateInterestEvents

  getRepaymentEvents = this.repaymentsService.createRepaymentEvents

  calculateRepayment = this.repaymentsService.calculateRepayment

  getFacilityFeeEvents = this.facilityFeeService.generateFacilityFeeEvents

  calculateFacilityFee = this.facilityFeeService.calculateFee
}

export default StrategyService
