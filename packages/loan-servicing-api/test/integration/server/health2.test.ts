import { MSSQLServerContainer } from '@testcontainers/mssqlserver'
import sql from 'mssql'

test(
  'should connect and return a query result',
  async () => {
    const container = await new MSSQLServerContainer().acceptLicense().start()

    const sqlConfig = {
      user: container.getUsername(),
      password: container.getPassword(),
      database: container.getDatabase(),
      server: container.getHost(),
      port: container.getPort(),
      pool: {
        max: 1,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      options: {
        trustServerCertificate: true,
      },
    }

    const connection = await sql.connect(sqlConfig)

    const { recordset } = await connection.query`SELECT 1;`
    expect(recordset).toStrictEqual([{ '': 1 }])

    await connection.close()
    await container.stop()
  },
  10 * 60 * 1000,
)
