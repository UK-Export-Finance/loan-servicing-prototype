import { TypeOrmModuleOptions } from "@nestjs/typeorm"
import SystemValueEntity from "models/SystemValueEntity"

const SQL_DB_CONFIG: TypeOrmModuleOptions = {
    type: 'mssql',
    host: process.env.SQL_DB_HOST,
    port: Number(process.env.SQL_DB_PORT),
    username: process.env.SQL_DB_USER,
    password: process.env.SQL_DB_PASSWORD,
    database: process.env.SQL_DB_NAME,
    schema: 'dbo',
    synchronize: process.env.NODE_ENV === 'development',
    entities: [
     SystemValueEntity
    ],
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  }
  
  export default SQL_DB_CONFIG