import { Module } from '@nestjs/common'
import { InitialModule } from './initial.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import User from '../entity/User'

@Module({
  imports: [
    InitialModule,
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.SQL_DB_HOST,
      port: Number(process.env.SQL_DB_PORT),
      username: 'sa',
      password: 'AbC!2345',
      database: 'LoanServicing',
      synchronize: true,
      entities: [User],
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    }),
  ],
})
export class AppModule {}
