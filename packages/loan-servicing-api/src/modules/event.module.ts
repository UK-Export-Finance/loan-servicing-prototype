import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import Event from 'models/entities/Event'
import EventService from 'services/event.service'

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [EventService],
  exports: [EventService]
})
class EventModule {}

export default EventModule
