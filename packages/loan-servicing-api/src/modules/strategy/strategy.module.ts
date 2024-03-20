import { Module } from '@nestjs/common'
import EventModule from 'modules/event/event.module'
import FacilityTypeEntity from 'models/entities/FacilityTypeEntity'
import { TypeOrmModule } from '@nestjs/typeorm'
import StrategyService from './strategy.service'
import RepaymentsService from './repayments/service'
import FacilityFeeService from './facilityFee/service'
import DrawingAccrualService from './drawingAccrual/service'

@Module({
  imports: [EventModule, TypeOrmModule.forFeature([FacilityTypeEntity])],
  providers: [
    StrategyService,
    RepaymentsService,
    FacilityFeeService,
    DrawingAccrualService,
  ],
  exports: [StrategyService],
})
class StrategyModule {}

export default StrategyModule
