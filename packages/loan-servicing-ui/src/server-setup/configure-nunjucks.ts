import nunjucks from 'nunjucks'
import { NestExpressApplication } from '@nestjs/platform-express'
import { dirname } from 'path'

const TEMPLATES_DIR = 'src/templates'

const configureNunjucks = (app: NestExpressApplication): void => {
  const express = app.getHttpAdapter().getInstance()
  const govUkFrontendDir = dirname(
    require.resolve('govuk-frontend/package.json'),
  )

  app.setViewEngine('njk')

  const nunjucksEnv = nunjucks.configure(
    [`${govUkFrontendDir}/dist`, TEMPLATES_DIR],
    {
      express,
      autoescape: true,
      noCache: true,
    },
  )

  nunjucksEnv.addGlobal('env', process.env.NODE_ENV)
}

export default configureNunjucks
