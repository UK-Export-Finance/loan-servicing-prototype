import dotenv from 'dotenv'
import { NestExpressApplication } from '@nestjs/platform-express'
import { NestFactory } from '@nestjs/core'
import AppModule from 'modules/app.module'
import { join } from 'path'
import { ValidationPipe } from '@nestjs/common'
import setupLiveReload from './server-setup/livereload'
import configureNunjucks from './server-setup/configure-nunjucks'

dotenv.config()

const port = process.env.PORT

if (process.env.NODE_ENV === 'development') {
  setupLiveReload()
}

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  configureNunjucks(app)
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/assets/' })
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  await app.listen(port ?? 3000)
}

bootstrap()
