import 'reflect-metadata'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import EventEntity from 'models/entities/EventEntity'
import FacilityEntity from 'models/entities/FacilityEntity'
import FacilityTransactionEntity from 'models/entities/FacilityTransactionEntity'

const SQL_DB_CONFIG: TypeOrmModuleOptions = {
  type: 'mssql',
  host: process.env.SQL_DB_HOST,
  port: Number(process.env.SQL_DB_PORT),
  username: 'sa',
  password: 'AbC!2345',
  database: 'LoanServicing',
  synchronize: true,
  entities: [EventEntity, FacilityEntity, FacilityTransactionEntity],
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
}

export default SQL_DB_CONFIG
