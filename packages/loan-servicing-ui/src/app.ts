import dotenv from 'dotenv'
import setupLiveReload from './server-setup/livereload'
import configureNunjucks from './server-setup/configure-nunjucks'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './modules/app.module'

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
