import { Module } from '@nestjs/common'
import FacilityService from 'services/facility.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import Facility from 'models/entities/Facility'
import FacilityController from 'controllers/facility.controller'
import EventModule from './event.module'

@Module({
  controllers: [FacilityController],
  imports: [EventModule, TypeOrmModule.forFeature([Facility])],
  providers: [FacilityService],
})
class FacilityModule {}

export default FacilityModule
