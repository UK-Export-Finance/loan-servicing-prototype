import { Module } from '@nestjs/common'
import FacilityService from 'modules/facility/facility.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import FacilityController from 'modules/facility/facility.controller'
import EventModule from 'modules/event/event.module'
import StrategyModule from 'modules/strategy/strategy.module'
import FacilityEntity from 'models/entities/FacilityEntity'
import ProjectionsModule from 'modules/projections/projections.module'
import TransactionEntity from 'models/entities/TransactionEntity'
import FacilityTransactionService from './facility.service.transactions'

@Module({
  controllers: [FacilityController],
  imports: [
    EventModule,
    TypeOrmModule.forFeature([FacilityEntity, TransactionEntity]),
    StrategyModule,
    ProjectionsModule,
  ],
  providers: [FacilityService, FacilityTransactionService],
  exports: [FacilityService],
})
class FacilityModule {}

export default FacilityModule
