import 'reflect-metadata'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import EventEntity from 'models/entities/EventEntity'
import DrawingEntity from 'models/entities/DrawingEntity'
import DrawingTransactionEntity from 'models/entities/FacilityTransactionEntity'
import FacilityType from 'models/entities/FacilityTypeEntity'
import FacilityEntity from 'models/entities/FacilityEntity'

const SQL_DB_CONFIG: TypeOrmModuleOptions = {
  type: 'mssql',
  host: process.env.SQL_DB_HOST,
  port: Number(process.env.SQL_DB_PORT),
  username: 'sa',
  password: 'AbC!2345',
  database: 'LoanServicing',
  synchronize: true,
  entities: [
    EventEntity,
    DrawingEntity,
    DrawingTransactionEntity,
    FacilityType,
    FacilityEntity,
  ],
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
}

export default SQL_DB_CONFIG
