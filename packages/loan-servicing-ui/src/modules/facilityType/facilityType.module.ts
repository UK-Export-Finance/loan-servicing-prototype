import { Module } from '@nestjs/common'
import FacilityTypeController from './facilityType.controller'
import FacilityTypeService from './facilityType.service'

@Module({
  controllers: [FacilityTypeController],
  providers: [FacilityTypeService],
  exports: [FacilityTypeService],
})
class FacilityTypeModule {}

export default FacilityTypeModule
