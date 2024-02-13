import dotenv from 'dotenv'
import { NestFactory } from '@nestjs/core'
import AppModule from './modules/app.module'

dotenv.config()

const port = process.env.PORT

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule)
  await app.listen(port ?? 3000)
}

bootstrap()
