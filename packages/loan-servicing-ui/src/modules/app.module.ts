import { Module } from '@nestjs/common'
import FacilityModule from './facility/facility.module'

@Module({
  imports: [FacilityModule],
})
class AppModule {}

export default AppModule
