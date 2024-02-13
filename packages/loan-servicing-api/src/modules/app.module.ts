import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import SQL_DB_CONFIG from 'database/data-source'
import FacilityModule from './facility.module'

@Module({
  imports: [FacilityModule, TypeOrmModule.forRoot(SQL_DB_CONFIG)],
})
class AppModule {}

export default AppModule
