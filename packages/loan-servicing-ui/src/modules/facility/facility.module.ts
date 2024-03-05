import { Module } from '@nestjs/common'
import FacilityController from 'modules/facility/facility.controller'
import FacilityService from 'modules/facility/facility.service'
import DrawingModule from 'modules/drawing/drawing.module'
import EditFacilityController from './facility.edit.controller'

@Module({
  controllers: [FacilityController, EditFacilityController],
  imports: [DrawingModule],
  providers: [FacilityService],
})
class FacilityModule {}

export default FacilityModule
