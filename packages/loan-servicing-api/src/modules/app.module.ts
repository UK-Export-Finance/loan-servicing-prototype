import { Module } from '@nestjs/common'
import SQL_DB_CONFIG from 'database/db-config'
import { TypeOrmModule } from '@nestjs/typeorm'
import ServerModule from './server/server.module'

@Module({
  imports: [
    ServerModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => SQL_DB_CONFIG,
    }),
  ],
})
class AppModule {}

export default AppModule
