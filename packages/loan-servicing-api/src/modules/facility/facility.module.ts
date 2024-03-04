import { Module } from '@nestjs/common'
import FacilityService from 'modules/facility/facility.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import FacilityController from 'modules/facility/facility.controller'
import FacilityProjectionsService from 'modules/facility/facility.service.projections'
import EventModule from 'modules/event/event.module'
import StrategyModule from 'modules/strategy/strategy.module'
import FacilityEntity from 'models/entities/FacilityEntity'

@Module({
  controllers: [FacilityController],
  imports: [
    EventModule,
    TypeOrmModule.forFeature([FacilityEntity]),
    StrategyModule,
  ],
  providers: [FacilityService, FacilityProjectionsService],
  exports: [FacilityService],
})
class FacilityModule {}

export default FacilityModule
