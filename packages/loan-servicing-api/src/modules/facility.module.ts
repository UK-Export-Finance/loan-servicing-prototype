import { Module } from '@nestjs/common'
import FacilityService from 'services/facility.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import FacilityEntity from 'models/entities/FacilityEntity'
import FacilityController from 'controllers/facility.controller'
import FacilityTransactionService from 'services/facilityTransaction.service'
import FacilityTransactionEntity from 'models/entities/FacilityTransactionEntity'
import EventModule from './event.module'

@Module({
  controllers: [FacilityController],
  imports: [
    EventModule,
    TypeOrmModule.forFeature([FacilityEntity, FacilityTransactionEntity]),
  ],
  providers: [FacilityService, FacilityTransactionService],
})
class FacilityModule {}

export default FacilityModule
