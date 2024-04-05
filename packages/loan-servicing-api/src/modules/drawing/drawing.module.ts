import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import DrawingEntity from 'models/entities/DrawingEntity'
import TransactionEntity from 'models/entities/TransactionEntity'
import EventModule from 'modules/event/event.module'
import StrategyModule from 'modules/strategy/strategy.module'
import FacilityEntity from 'models/entities/FacilityEntity'
import ProjectionsModule from 'modules/projections/projections.module'
import SystemValueModule from 'modules/systemValue/systemValue.module'
import DrawingController from './drawing.controller'
import DrawingTransactionService from './drawing.transactions.service'
import DrawingService from './drawing.service'

@Module({
  controllers: [DrawingController],
  imports: [
    EventModule,
    TypeOrmModule.forFeature([
      DrawingEntity,
      TransactionEntity,
      FacilityEntity,
    ]),
    StrategyModule,
    ProjectionsModule,
    SystemValueModule,
  ],
  providers: [DrawingTransactionService, DrawingService],
  exports: [],
})
class DrawingModule {}

export default DrawingModule
