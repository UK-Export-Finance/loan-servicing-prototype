import dotenv from 'dotenv'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import AppModule from './modules/app.module'

dotenv.config()

const port = process.env.PORT

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('Loan Servicing API')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  app.useGlobalPipes(new ValidationPipe())

  await app.listen(port ?? 3000)
}

bootstrap()
