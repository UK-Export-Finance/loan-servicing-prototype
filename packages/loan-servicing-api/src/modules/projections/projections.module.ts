import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import DrawingEntity from 'models/entities/DrawingEntity'
import TransactionEntity from 'models/entities/TransactionEntity'
import EventModule from 'modules/event/event.module'
import StrategyModule from 'modules/strategy/strategy.module'
import FacilityEntity from 'models/entities/FacilityEntity'
import PendingEventModule from 'modules/pendingEvents/pendingEvent.module'
import SystemValueModule from 'modules/systemValue/systemValue.module'
import ProjectionsService from './projections.service'
import DrawingEventHandlingService from './drawing.service.events'
import FacilityEventHandlingService from './facility.service.events'

@Module({
  imports: [
    EventModule,
    PendingEventModule,
    TypeOrmModule.forFeature([
      DrawingEntity,
      TransactionEntity,
      FacilityEntity,
    ]),
    StrategyModule,
    SystemValueModule,
  ],
  providers: [
    ProjectionsService,
    DrawingEventHandlingService,
    FacilityEventHandlingService,
  ],
  exports: [ProjectionsService],
})
class ProjectionsModule {}

export default ProjectionsModule
