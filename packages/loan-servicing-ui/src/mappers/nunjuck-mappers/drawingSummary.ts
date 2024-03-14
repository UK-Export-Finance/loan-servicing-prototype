import { DrawingDto } from 'loan-servicing-common'
import { placeholderToString } from 'strings/strategyNames'
import { GovUkSummaryListProps } from 'types/nunjucks'

// eslint-disable-next-line import/prefer-default-export
export const drawingToDrawingSummary = (
  drawing: DrawingDto,
): GovUkSummaryListProps => {
  const repayment = drawing.drawingConfig.repaymentsStrategy
  return {
    rows: [
      {
        key: {
          text: 'Interest Strategy',
        },
        value: {
          text: placeholderToString(
            drawing.drawingConfig.calculateInterestStrategy.name,
          ),
        },
      },
      {
        key: {
          text: 'Interest Rate',
        },
        value: {
          text: `${drawing.interestRate}%`,
        },
        actions: {
          items: [
            {
              href: `/facility/${drawing.facility.streamId}/drawing/${drawing.streamId}/changeInterest`,
              text: 'Change',
              visuallyHiddenText: 'interest rate',
            },
          ],
        },
      },
      {
        key: {
          text: 'Drawing Accruals',
        },
        value: {
          html: drawing.accruals
            .map(({ id, balance }) => `Fee ${id.slice(0, 5)}: £${balance}`)
            .join('<br />'),
        },
        actions: {
          items: [
            {
              href: `/facility/${drawing.facility.streamId}/drawing/${drawing.streamId}/addAccrual`,
              text: 'Add new',
              visuallyHiddenText: 'fee',
            },
          ],
        },
      },
      {
        key: {
          text: 'Start Date',
        },
        value: {
          text: new Date(drawing.issuedEffectiveDate).toLocaleDateString(
            'en-GB',
          ),
        },
      },
      {
        key: {
          text: 'End Date',
        },
        value: {
          text: new Date(drawing.expiryDate).toLocaleDateString('en-GB'),
        },
      },
      {
        key: {
          text: 'Repayments Strategy',
        },
        value: {
          html:
            repayment.name === 'Regular'
              ? `<b>${repayment.name}</b><br/>First payment: ${new Date(repayment.startDate).toLocaleDateString('en-GB')}<br/>Months between payments: ${repayment.monthsBetweenRepayments}`
              : `<b>${repayment.name}</b> - ${repayment.repayments.length} payments`,
        },
      },
    ],
  }
}
