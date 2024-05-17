/* eslint-disable import/no-import-module-exports */
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { databaseEntities } from 'database/db-config'
import ServerModule from 'modules/server/server.module'
import { DataSource } from 'typeorm'
import { DataSourceOptions } from 'typeorm/browser'

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var integrationTestApp: INestApplication
}

const createRandomString = (length: number) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  let result = ''
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
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
      ServerModule,
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
  await app.init()
  global.integrationTestApp = app
}

module.exports = setupIntegrationTestInstance
