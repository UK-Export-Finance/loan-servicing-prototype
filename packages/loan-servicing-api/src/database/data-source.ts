import 'reflect-metadata'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import User from 'models/entities/User'
import Event from 'models/entities/Event'

const SQL_DB_CONFIG: TypeOrmModuleOptions = {
  type: 'mssql',
  host: process.env.SQL_DB_HOST,
  port: Number(process.env.SQL_DB_PORT),
  username: 'sa',
  password: 'AbC!2345',
  database: 'LoanServicing',
  synchronize: true,
  entities: [User, Event],
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
}

export default SQL_DB_CONFIG
