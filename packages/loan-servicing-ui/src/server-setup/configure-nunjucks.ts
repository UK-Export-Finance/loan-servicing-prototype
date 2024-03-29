import nunjucks from 'nunjucks'
import { NestExpressApplication } from '@nestjs/platform-express'
import { dirname } from 'path'
import { placeholderToString } from 'strings/strategyNames'
import { RepaymentStrategyOptions } from 'loan-servicing-common'

const TEMPLATES_DIR = 'src/templates'

export const parseDate = (date: string): string =>
  new Date(date).toLocaleDateString('en-GB')

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

  nunjucksEnv.addFilter('parseDate', parseDate)

  nunjucksEnv.addFilter('enumToNameString', placeholderToString)

  nunjucksEnv.addFilter(
    'repaymentToString',
    (repayment: RepaymentStrategyOptions) =>
      repayment.name === 'Regular'
        ? `<b>${repayment.name}</b><br/>First payment: ${new Date(repayment.startDate).toLocaleDateString('en-GB')}<br/>Months between payments: ${repayment.monthsBetweenRepayments}`
        : `<b>${repayment.name}</b> - ${repayment.repayments.length} payments`,
  )
  nunjucksEnv.addFilter(
    'convertToDateInput',
    (strDate: string) => new Date(strDate).toISOString().split('T')[0],
  )

  nunjucksEnv.addGlobal('env', process.env.NODE_ENV)
}

export default configureNunjucks
