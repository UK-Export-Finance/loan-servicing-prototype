import { Module } from '@nestjs/common'
import SQL_DB_CONFIG from 'database/db-config'
import { TypeOrmModule } from '@nestjs/typeorm'
import SystemModule from './system/system.module'

@Module({
  imports: [
    SystemModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => SQL_DB_CONFIG,
    }),
  ],
})
class AppModule {}

export default AppModule
