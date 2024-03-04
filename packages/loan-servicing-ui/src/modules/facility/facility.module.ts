import { Module } from '@nestjs/common'
import FacilityController from 'modules/facility/facility.controller'
import FacilityService from 'modules/facility/facility.service'
import EditFacilityController from './facility.edit.controller'

@Module({
  controllers: [FacilityController, EditFacilityController],
  providers: [FacilityService],
})
class FacilityModule {}

export default FacilityModule
