import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import DrawingEntity from 'models/entities/DrawingEntity'
import DrawingTransactionEntity from 'models/entities/FacilityTransactionEntity'
import EventModule from 'modules/event/event.module'
import StrategyModule from 'modules/strategy/strategy.module'
import DrawingController from './drawing.controller'
import DrawingProjectionsService from './drawing.service.projections'
import DrawingService from './drawing.service'

@Module({
  controllers: [DrawingController],
  imports: [
    EventModule,
    TypeOrmModule.forFeature([DrawingEntity, DrawingTransactionEntity]),
    StrategyModule,
  ],
  providers: [DrawingProjectionsService, DrawingService],
  exports: [],
})
class DrawingModule {}

export default DrawingModule
