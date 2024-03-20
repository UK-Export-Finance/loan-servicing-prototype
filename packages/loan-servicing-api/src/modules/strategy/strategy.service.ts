import { Inject } from '@nestjs/common'
import RepaymentsService from './repayments/service'
import FacilityFeeService from './facilityFee/service'
import DrawingAccrualService from './drawingAccrual/service'

class StrategyService {
  constructor(
    @Inject(RepaymentsService) private repaymentsService: RepaymentsService,
    @Inject(FacilityFeeService) private facilityFeeService: FacilityFeeService,
    @Inject(DrawingAccrualService)
    private drawingAccrualService: DrawingAccrualService,
  ) {}

  getRepayments = this.repaymentsService.createRepayments

  getEventsForFacilityFee = this.facilityFeeService.generateEventsForSingleFee

  calculateFacilityFee = this.facilityFeeService.calculateFee

  calculateDrawingAccrual = this.drawingAccrualService.calculateAccrual

  getEventsForDrawingAccrual =
    this.drawingAccrualService.generateEventsForAccrual
}

export default StrategyService
