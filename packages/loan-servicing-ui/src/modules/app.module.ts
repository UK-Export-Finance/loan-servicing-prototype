import { Module } from '@nestjs/common'
import FacilityModule from './facility/facility.module'
import FacilityTypeModule from './facilityType/facilityType.module'
import DrawingModule from './drawing/drawing.module'
import DevModule from './dev/dev.module'

@Module({
  imports: [FacilityModule, FacilityTypeModule, DrawingModule, DevModule],
})
class AppModule {}

export default AppModule
