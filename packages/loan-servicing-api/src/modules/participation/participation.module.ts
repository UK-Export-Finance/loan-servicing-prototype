import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import TransactionEntity from 'models/entities/TransactionEntity'
import EventModule from 'modules/event/event.module'
import StrategyModule from 'modules/strategy/strategy.module'
import FacilityEntity from 'models/entities/FacilityEntity'
import ProjectionsModule from 'modules/projections/projections.module'
import SystemValueModule from 'modules/systemValue/systemValue.module'
import ParticipationController from './participation.controller'
import ParticipationService from './participation.service'

@Module({
  controllers: [ParticipationController],
  imports: [
    EventModule,
    TypeOrmModule.forFeature([TransactionEntity, FacilityEntity]),
    StrategyModule,
    ProjectionsModule,
    SystemValueModule,
  ],
  providers: [ParticipationService],
  exports: [],
})
class ParticipationModule {}

export default ParticipationModule
