import { Module } from '@nestjs/common'
import FacilityService from 'modules/facility/facility.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import FacilityController from 'modules/facility/facility.controller'
import EventModule from 'modules/event/event.module'
import StrategyModule from 'modules/strategy/strategy.module'
import FacilityEntity from 'models/entities/FacilityEntity'
import ProjectionsModule from 'modules/projections/projections.module'
import TransactionEntity from 'models/entities/TransactionEntity'
import SystemValueModule from 'modules/systemValue/systemValue.module'
import FacilityTypeModule from 'modules/facilityType/facilityType.module'
import FacilityTransactionService from './facility.transactions.service'

@Module({
  controllers: [FacilityController],
  imports: [
    EventModule,
    TypeOrmModule.forFeature([FacilityEntity, TransactionEntity]),
    StrategyModule,
    FacilityTypeModule,
    ProjectionsModule,
    SystemValueModule,
  ],
  providers: [FacilityService, FacilityTransactionService],
  exports: [FacilityService],
})
class FacilityModule {}

export default FacilityModule
