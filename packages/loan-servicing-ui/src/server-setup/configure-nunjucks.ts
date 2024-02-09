import nunjucks from 'nunjucks'
import { NestExpressApplication } from '@nestjs/platform-express'

const TEMPLATES_DIR = 'src/templates'

const configureNunjucks = (app: NestExpressApplication) => {
  const express = app.getHttpAdapter().getInstance()
  app.setBaseViewsDir(TEMPLATES_DIR)
  app.setViewEngine('njk')

  const nunjucksEnv = nunjucks.configure(TEMPLATES_DIR, {
    express: express,
    autoescape: true,
    noCache: true,
  })

  nunjucksEnv.addGlobal('env', process.env.NODE_ENV)
}

export default configureNunjucks
