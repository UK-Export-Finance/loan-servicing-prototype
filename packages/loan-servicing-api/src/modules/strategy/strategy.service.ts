import { Inject } from '@nestjs/common'
import CalculateInterestService from './calculateInterest/service'
import RepaymentsService from './repayments/service'
import FacilityFeeService from './facilityFee/service'
import DrawingAccrualService from './drawingAccrual/service'

class StrategyService {
  constructor(
    @Inject(CalculateInterestService)
    private calculateInterestService: CalculateInterestService,
    @Inject(RepaymentsService) private repaymentsService: RepaymentsService,
    @Inject(FacilityFeeService) private facilityFeeService: FacilityFeeService,
    @Inject(DrawingAccrualService) private drawingAccrualService: DrawingAccrualService,
  ) {}

  calculateInterest = this.calculateInterestService.calculate

  getInterestEvents = this.calculateInterestService.generateInterestEvents

  getRepaymentEvents = this.repaymentsService.createRepaymentEvents

  calculateRepayment = this.repaymentsService.calculateRepayment

  getEventsForFacilityFee = this.facilityFeeService.generateEventsForSingleFee

  calculateFacilityFee = this.facilityFeeService.calculateFee

  calculateDrawingAccrual = this.drawingAccrualService.calculateAccrual
  
  getEventsForDrawingAccrual = this.drawingAccrualService.generateEventsForAccrual
}

export default StrategyService
