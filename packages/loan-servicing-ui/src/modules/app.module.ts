import { Module } from '@nestjs/common'
import FacilityModule from './facility/facility.module'
import FacilityTypeModule from './facilityType/facilityType.module'
import DrawingModule from './drawing/drawing.module'

@Module({
  imports: [FacilityModule, FacilityTypeModule, DrawingModule],
})
class AppModule {}

export default AppModule
