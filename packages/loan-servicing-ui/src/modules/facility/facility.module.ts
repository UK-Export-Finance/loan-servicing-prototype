import { Module } from '@nestjs/common'
import FacilityController from 'modules/facility/facility.controller'

@Module({
  controllers: [FacilityController],
})
class FacilityModule {}

export default FacilityModule
