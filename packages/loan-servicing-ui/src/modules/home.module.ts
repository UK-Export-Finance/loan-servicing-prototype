import { Module } from '@nestjs/common'
import FacilityController from 'controllers/facility.controller'
import FacilityService from 'services/user.service'

@Module({ controllers: [FacilityController], providers: [FacilityService] })
class HomeModule {}

export default HomeModule
