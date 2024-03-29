import 'reflect-metadata'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import EventEntity from 'models/entities/EventEntity'
import DrawingEntity from 'models/entities/DrawingEntity'
import TransactionEntity from 'models/entities/TransactionEntity'
import FacilityType from 'models/entities/FacilityTypeEntity'
import FacilityEntity from 'models/entities/FacilityEntity'
import PendingEventEntity from 'models/entities/PendingEventEntity'
import SystemValueEntity from 'models/entities/SystemValueEntity'

const SQL_DB_CONFIG: TypeOrmModuleOptions = {
  type: 'mssql',
  host: process.env.SQL_DB_HOST,
  port: Number(process.env.SQL_DB_PORT),
  username: process.env.SQL_DB_USER,
  password: process.env.SQL_DB_PASSWORD,
  database: process.env.SQL_DB_NAME,
  schema: 'dbo',
  synchronize: true,
  entities: [
    EventEntity,
    DrawingEntity,
    TransactionEntity,
    FacilityType,
    FacilityEntity,
    PendingEventEntity,
    SystemValueEntity,
  ],
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
}

export default SQL_DB_CONFIG
