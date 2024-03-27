import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import PendingEventEntity from 'models/entities/PendingEventEntity'
import SystemValueModule from 'modules/systemValue/systemValue.module'
import DrawingEntity from 'models/entities/DrawingEntity'
import PendingEventService from './pendingEvent.service'
import PendingEventController from './pendingEvent.controller'

@Module({
  controllers: [PendingEventController],
  imports: [
    TypeOrmModule.forFeature([PendingEventEntity, DrawingEntity]),
    SystemValueModule,
  ],
  providers: [PendingEventService],
  exports: [PendingEventService],
})
class PendingEventModule {}

export default PendingEventModule
