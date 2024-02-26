import { Module } from '@nestjs/common'
import FacilityController from 'modules/facility/facility.controller'
import FacilityService from 'modules/facility/facility.service'

@Module({ controllers: [FacilityController], providers: [FacilityService] })
class FacilityTypeModule {}

export default FacilityTypeModule
