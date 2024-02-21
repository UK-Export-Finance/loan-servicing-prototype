import { Module } from '@nestjs/common'
import FacilityService from 'services/facility.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import FacilityEntity from 'models/entities/FacilityEntity'
import FacilityController from 'controllers/facility.controller'
import FacilityProjectionsService from 'services/facilityProjections.service'
import FacilityTransactionEntity from 'models/entities/FacilityTransactionEntity'
import EventModule from './event.module'

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
