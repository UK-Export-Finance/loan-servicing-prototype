/* eslint-disable import/no-import-module-exports */
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TypeOrmModuleOptions, TypeOrmModule } from '@nestjs/typeorm'
import { MSSQLServerContainer, StartedMSSQLServerContainer } from '@testcontainers/mssqlserver'
import { databaseEntities } from 'database/db-config'
import ServerModule from 'modules/server/server.module'

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var integrationTestApp: INestApplication
  // eslint-disable-next-line vars-on-top, no-var
  var integrationTestDbContainer: StartedMSSQLServerContainer
}

const setupIntegrationTestInstance = async () => {
  const container = await new MSSQLServerContainer().acceptLicense().start()

  const sqlConfig: TypeOrmModuleOptions = {
    type: 'mssql',
    username: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
    host: container.getHost(),
    port: container.getPort(),
    entities: databaseEntities,
    synchronize: true,
    pool: {
      max: 1,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      trustServerCertificate: true,
    },
  }

  const moduleRef = await Test.createTestingModule({
    imports: [
      ServerModule,
      TypeOrmModule.forRootAsync({
        useFactory: () => sqlConfig,
      }),
    ],
  }).compile()

  const app = moduleRef.createNestApplication()
  await app.init()
  global.integrationTestApp = app
  global.integrationTestDbContainer = container
}

module.exports = setupIntegrationTestInstance
