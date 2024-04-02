import { Module } from '@nestjs/common'
import FacilityController from 'modules/facility/facility.controller'
import FacilityService from 'modules/facility/facility.service'
import DrawingModule from 'modules/drawing/drawing.module'
import FacilityTypeModule from 'modules/facilityType/facilityType.module'
import EditFacilityController from './facility.edit.controller'

@Module({
  controllers: [FacilityController, EditFacilityController],
  imports: [DrawingModule, FacilityTypeModule],
  providers: [FacilityService],
})
class FacilityModule {}

export default FacilityModule
