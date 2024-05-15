import dotenv from 'dotenv'
import { NestFactory } from '@nestjs/core'
import AppModule from 'modules/app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

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

  await app.listen(port ?? 3000)
}

// eslint-disable-next-line no-void
void bootstrap()
