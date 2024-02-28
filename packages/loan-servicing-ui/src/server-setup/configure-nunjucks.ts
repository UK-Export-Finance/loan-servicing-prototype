import nunjucks from 'nunjucks'
import { NestExpressApplication } from '@nestjs/platform-express'
import { dirname } from 'path'
import { allPlaceholders } from 'strings/strategyNames'

const TEMPLATES_DIR = 'src/templates'

const configureNunjucks = (app: NestExpressApplication): void => {
  const express = app.getHttpAdapter().getInstance()
  // This way allows the right dir to be found regardless of where node_modules is
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

  nunjucksEnv.addFilter('parseDate', (date: string): string =>
    new Date(date).toLocaleString('en-GB'),
  )

  nunjucksEnv.addFilter(
    'enumToNameString',
    (enumValue: string): string => allPlaceholders[enumValue] ?? enumValue,
  )

  nunjucksEnv.addGlobal('env', process.env.NODE_ENV)
}

export default configureNunjucks
