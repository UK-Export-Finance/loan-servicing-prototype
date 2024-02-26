import { Module } from '@nestjs/common'
import FacilityModule from './facility/facility.module'
import FacilityTypeModule from './facilityType/facilityType.module'

@Module({
  imports: [FacilityModule, FacilityTypeModule],
})
class AppModule {}

export default AppModule
