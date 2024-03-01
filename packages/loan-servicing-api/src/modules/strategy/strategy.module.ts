import { Module } from '@nestjs/common'
import EventModule from 'modules/event/event.module'
import FacilityTypeEntity from 'models/entities/FacilityTypeEntity'
import { TypeOrmModule } from '@nestjs/typeorm'
import CalculateInterestService from './calculateInterest/service'
import StrategyService from './strategy.service'
import RepaymentsService from './repayments/service'

@Module({
  imports: [EventModule, TypeOrmModule.forFeature([FacilityTypeEntity])],
  providers: [CalculateInterestService, StrategyService, RepaymentsService],
  exports: [StrategyService],
})
class StrategyModule {}

export default StrategyModule
