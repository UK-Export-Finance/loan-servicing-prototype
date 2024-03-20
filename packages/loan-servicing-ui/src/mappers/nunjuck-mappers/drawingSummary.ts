import { DrawingDto, Repayment } from 'loan-servicing-common'
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

const getRepaymentSummaryText = (
  repayment: Repayment,
  currentDate: string,
): string => {
  if (repayment.settled) {
    return 'payment settled'
  }
  if (new Date(repayment.date) < new Date(currentDate)) {
    if (repayment.paidAmount !== '0') {
      return `£${repayment.paidAmount} received, not settled`
    }
    return 'payment overdue'
  }
  return 'payment not yet due'
}

export const drawingToRepaymentsSummary = (
  facilityId: string,
  { currentDate, repayments, streamId: drawingId }: DrawingDto,
): GovUkSummaryListProps => ({
  card: {
    title: { text: 'Repayments' },
  },
  rows: repayments.map((repayment) => ({
    key: { text: new Date(repayment.date).toLocaleDateString('en-GB') },
    value: {
      text: `£${repayment.expectedAmount} (${getRepaymentSummaryText(repayment, currentDate)})`,
    },
    actions: repayment.settled
      ? undefined
      : {
          items: [
            {
              href: `/facility/${facilityId}/drawing/${drawingId}/recordRepayment?repaymentId=${repayment.id}`,
              text: 'Record receipt',
            },
          ],
        },
  })),
})
