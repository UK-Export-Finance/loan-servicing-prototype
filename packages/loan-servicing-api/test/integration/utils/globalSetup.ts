/* eslint-disable no-param-reassign */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable import/no-import-module-exports */
import {
  MSSQLServerContainer,
  StartedMSSQLServerContainer,
} from '@testcontainers/mssqlserver'

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var integrationTestDbContainer: StartedMSSQLServerContainer
  var sqlContainerUsername: string
  var sqlContainerPassword: string
  var sqlContainerDatabase: string
  var sqlContainerHost: string
  var sqlContainerPort: number
}

const globalSetup = async (_: any, projectConfig: any) => {
  const container = await new MSSQLServerContainer().acceptLicense().start()
  projectConfig.globals.sqlContainerUsername = container.getUsername()
  projectConfig.globals.sqlContainerPassword = container.getPassword()
  projectConfig.globals.sqlContainerDatabase = container.getDatabase()
  projectConfig.globals.sqlContainerHost = container.getHost()
  projectConfig.globals.sqlContainerPort = container.getPort()
  global.integrationTestDbContainer = container
}

module.exports = globalSetup
