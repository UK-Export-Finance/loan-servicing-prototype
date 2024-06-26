import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import SQL_DB_CONFIG from 'database/data-source'
import { DataSource } from 'typeorm'
import { addTransactionalDataSource } from 'typeorm-transactional'
import FacilityModule from './facility/facility.module'
import FacilityTypeModule from './facilityType/facilityType.module'
import DrawingModule from './drawing/drawing.module'
import ParticipationModule from './participation/participation.module'

@Module({
  imports: [
    FacilityModule,
    FacilityTypeModule,
    DrawingModule,
    ParticipationModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => SQL_DB_CONFIG,
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed')
        }

        return addTransactionalDataSource(new DataSource(options))
      },
    }),
  ],
})
class AppModule {}

export default AppModule
