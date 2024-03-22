import { DrawingAccrual, DrawingDto, Repayment } from 'loan-servicing-common'
import { GovUkSummaryListProps, NunjuckTableRow } from 'types/nunjucks'
import { buildNunjucksTableRow } from 'utils/nunjucks-parsers'

// eslint-disable-next-line import/prefer-default-export
export const drawingToDrawingSummary = (
  drawing: DrawingDto,
): GovUkSummaryListProps => ({
  rows: [
    {
      key: {
        text: 'Drawing Accruals',
      },
      value: {
        html: drawing.accruals
          .map(
            ({ id, currentValue }) => `Fee ${id.slice(0, 5)}: £${currentValue}`,
          )
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
        text: new Date(drawing.issuedEffectiveDate).toLocaleDateString('en-GB'),
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
  ],
})

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

const getAccrualTableRow = (
  a: DrawingAccrual,
): {
  startDate: string
  endDate: string
  rate: string
  currentBalance: string
  finalBalance: string
} => ({
  startDate: new Date(a.config.effectiveDate).toLocaleDateString('en-GB'),
  endDate: new Date(a.config.expiryDate).toLocaleDateString('en-GB'),
  rate: a.config.accrualRate,
  currentBalance: a.currentValue,
  finalBalance: a.finalValue,
})

export const accrualsToTable = ({ accruals }: DrawingDto): NunjuckTableRow[] =>
  accruals
    .map(getAccrualTableRow)
    .map((r) =>
      buildNunjucksTableRow(r, [
        'startDate',
        'endDate',
        'rate',
        'currentBalance',
        'finalBalance',
      ]),
    )
