/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable import/no-import-module-exports */
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { databaseEntities } from 'database/db-config'
import SystemModule from 'modules/system/system.module'
import TestAgent from 'supertest/lib/agent'
import { DataSource } from 'typeorm'
import { DataSourceOptions } from 'typeorm/browser'
import supertestRequest from 'supertest'

declare global {
  var integrationTestApp: INestApplication
  var request: TestAgent
  var testDb: DataSource
}

const createRandomString = (length: number) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const setupIntegrationTestInstance = async () => {
  const schemaName = createRandomString(8)

  const sqlConfig: DataSourceOptions = {
    type: 'mssql',
    username: global.sqlContainerUsername,
    password: global.sqlContainerPassword,
    database: global.sqlContainerDatabase,
    host: global.sqlContainerHost,
    port: global.sqlContainerPort,
    entities: databaseEntities,
    pool: {
      max: 1,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      trustServerCertificate: true,
    },
  }

  const dataSource = new DataSource(sqlConfig)

  await dataSource.initialize()

  await dataSource.manager.query(`CREATE SCHEMA ${schemaName};`)

  await dataSource.destroy()

  const moduleRef = await Test.createTestingModule({
    imports: [
      SystemModule,
      TypeOrmModule.forRootAsync({
        useFactory: () => ({
          ...sqlConfig,
          schema: schemaName,
          synchronize: true,
        }),
      }),
    ],
  }).compile()

  const app = moduleRef.createNestApplication()
  const testDbSource = new DataSource({...sqlConfig, schema: schemaName})
  await Promise.all([app.init(), testDbSource.initialize()])
  global.integrationTestApp = app
  global.testDb = testDbSource
  global.request = supertestRequest(app.getHttpServer())
}

module.exports = setupIntegrationTestInstance
