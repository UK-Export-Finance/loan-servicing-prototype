import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import EventEntity from 'models/entities/EventEntity'
import EventService from 'services/event.service'

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  providers: [EventService],
  exports: [EventService]
})
class EventModule {}

export default EventModule
