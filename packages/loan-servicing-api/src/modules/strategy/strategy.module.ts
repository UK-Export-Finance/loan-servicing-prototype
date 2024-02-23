import { Module } from '@nestjs/common'
import EventModule from 'modules/event/event.module'
import FacilityTypeEntity from 'models/entities/FacilityType'
import { TypeOrmModule } from '@nestjs/typeorm'
import CalculateInterestService from './calculateInterest/service'
import StrategyService from './strategy.service'
import { strategyOptionsProviderConfig } from './strategyOptions.provider'

@Module({
  imports: [EventModule, TypeOrmModule.forFeature([FacilityTypeEntity])],
  providers: [
    CalculateInterestService,
    StrategyService,
    strategyOptionsProviderConfig,
  ],
  exports: [StrategyService],
})
class StrategyModule {}

export default StrategyModule
