import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import SQL_DB_CONFIG from 'database/data-source'
import UserModule from './user.module'
import FacilityModule from './facility.module'

@Module({
  imports: [UserModule, FacilityModule, TypeOrmModule.forRoot(SQL_DB_CONFIG)],
})
class AppModule {}

export default AppModule
