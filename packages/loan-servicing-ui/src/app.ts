import dotenv from 'dotenv'
import { NestExpressApplication } from '@nestjs/platform-express'
import { NestFactory } from '@nestjs/core'
import AppModule from 'modules/app.module'
import setupLiveReload from './server-setup/livereload'
import configureNunjucks from './server-setup/configure-nunjucks'

dotenv.config()

const port = process.env.PORT

if (process.env.NODE_ENV === 'development') {
  setupLiveReload()
}

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  configureNunjucks(app)
  await app.listen(port ?? 3000)
}

bootstrap()
