import { Module } from '@nestjs/common'
import FacilityService from 'modules/facility/facility.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import FacilityController from 'modules/facility/facility.controller'
import EventModule from 'modules/event/event.module'
import StrategyModule from 'modules/strategy/strategy.module'
import FacilityEntity from 'models/entities/FacilityEntity'
import ProjectionsModule from 'modules/projections/projections.module'

@Module({
  controllers: [FacilityController],
  imports: [
    EventModule,
    TypeOrmModule.forFeature([FacilityEntity]),
    StrategyModule,
    ProjectionsModule
  ],
  providers: [FacilityService],
  exports: [FacilityService],
})
class FacilityModule {}

export default FacilityModule
