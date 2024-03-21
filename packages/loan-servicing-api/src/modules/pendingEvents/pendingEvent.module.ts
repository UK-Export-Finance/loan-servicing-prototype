import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import PendingEventEntity from 'models/entities/PendingEventEntity'
import PendingEventService from './pendingEvent.service'

@Module({
  imports: [TypeOrmModule.forFeature([PendingEventEntity])],
  providers: [PendingEventService],
  exports: [PendingEventService],
})
class PendingEventModule {}

export default PendingEventModule
