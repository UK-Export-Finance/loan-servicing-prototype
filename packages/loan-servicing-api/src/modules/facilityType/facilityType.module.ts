import { Module } from '@nestjs/common'
import EventModule from 'modules/event/event.module'
import FacilityTypeEntity from 'models/entities/FacilityTypeEntity'
import { TypeOrmModule } from '@nestjs/typeorm'
import FacilityModule from 'modules/facility/facility.module'
import FacilityTypeController from './facilityType.controller'
import FacilityTypeService from './facilityType.service'

@Module({
  controllers: [FacilityTypeController],
  imports: [
    EventModule,
    TypeOrmModule.forFeature([FacilityTypeEntity]),
    FacilityModule,
  ],
  providers: [FacilityTypeService],
  exports: [FacilityTypeService],
})
class FacilityTypeModule {}

export default FacilityTypeModule
