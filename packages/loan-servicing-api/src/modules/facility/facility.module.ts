import { Module } from '@nestjs/common'
import FacilityService from 'modules/facility/facility.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import FacilityEntity from 'models/entities/FacilityEntity'
import FacilityController from 'modules/facility/facility.controller'
import FacilityProjectionsService from 'modules/facility/facilityProjections.service'
import FacilityTransactionEntity from 'models/entities/FacilityTransactionEntity'
import EventModule from 'modules/event/event.module'
import StrategyModule from 'modules/strategy/strategy.module'

@Module({
  controllers: [FacilityController],
  imports: [
    EventModule,
    TypeOrmModule.forFeature([FacilityEntity, FacilityTransactionEntity]),
    StrategyModule,
  ],
  providers: [FacilityService, FacilityProjectionsService],
  exports: [FacilityService],
})
class FacilityModule {}

export default FacilityModule
