import { DataSource } from 'typeorm'
import 'reflect-metadata'
import User from '../entity/User'

export const getSqlDbDataSource = () =>
  new DataSource({
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
  })
