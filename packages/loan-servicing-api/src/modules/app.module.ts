import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import UserModule from './user.module'
import SQL_DB_CONFIG from '../database/data-source'

@Module({
  imports: [UserModule, TypeOrmModule.forRoot(SQL_DB_CONFIG)],
})
class AppModule {}

export default AppModule
