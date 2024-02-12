import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import SQL_DB_CONFIG from 'database/data-source'
import UserModule from './user.module'

@Module({
  imports: [UserModule, TypeOrmModule.forRoot(SQL_DB_CONFIG)],
})
class AppModule {}

export default AppModule
