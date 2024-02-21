import { Module } from '@nestjs/common'
import FacilityService from 'modules/facility/facility.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import FacilityEntity from 'models/entities/FacilityEntity'
import FacilityController from 'modules/facility/facility.controller'
import FacilityProjectionsService from 'modules/facility/facilityProjections.service'
import FacilityTransactionEntity from 'models/entities/FacilityTransactionEntity'
import EventModule from '../event/event.module'

@Module({
  controllers: [FacilityController],
  imports: [
    EventModule,
    TypeOrmModule.forFeature([FacilityEntity, FacilityTransactionEntity]),
  ],
  providers: [FacilityService, FacilityProjectionsService],
})
class FacilityModule {}

export default FacilityModule
