import { Module } from '@nestjs/common'
import EventModule from 'modules/event/event.module'
import FacilityTypeEntity from 'models/entities/FacilityTypeEntity'
import { TypeOrmModule } from '@nestjs/typeorm'
import CalculateInterestService from './calculateInterest/service'
import StrategyService from './strategy.service'
import { strategyOptionsProviderConfig } from './strategyOptions.provider'
import FacilityTypeService from './facilityType.service'
import FacilityTypeController from './facilityType.controller'

@Module({
  controllers: [FacilityTypeController],
  imports: [EventModule, TypeOrmModule.forFeature([FacilityTypeEntity])],
  providers: [
    CalculateInterestService,
    StrategyService,
    strategyOptionsProviderConfig,
    FacilityTypeService,
  ],
  exports: [StrategyService],
})
class StrategyModule {}

export default StrategyModule
