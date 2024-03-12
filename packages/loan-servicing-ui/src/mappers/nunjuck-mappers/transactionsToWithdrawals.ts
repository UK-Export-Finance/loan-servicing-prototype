import { SummarisedTransaction } from 'loan-servicing-common'
import { GovUkSummaryListProps } from 'types/nunjucks'

const mapTransactionsToWithdrawalsSummary = (
  facilityId: string,
  drawingId: string,
  transactions: SummarisedTransaction[],
): GovUkSummaryListProps => {
  const withdrawalTransactions = transactions.filter(
    (t) => t.sourceEvent?.type === 'WithdrawFromDrawing',
  )
  return {
    card: {
      title: { text: 'Withdrawals' },
      actions: {
        items: [
          {
            href: `/facility/${facilityId}/drawing/${drawingId}/add-withdrawal`,
            text: 'Add',
            visuallyHiddenText: 'new withdrawal',
          },
        ],
      },
    },
    rows: withdrawalTransactions.map((withdrawal) => ({
      key: { text: new Date(withdrawal.datetime).toLocaleDateString('en-GB') },
      value: {
        text: `£${withdrawal.changeInValue}`,
      },
      actions: {
        items: [
          {
            href: `/facility/${facilityId}/drawing/${drawingId}/withdrawal/${withdrawal.sourceEvent?.streamVersion}/revert/`,
            text: 'Revert',
            visuallyHiddenText: 'withdrawal',
          },
        ],
      },
    })),
  }
}

export default mapTransactionsToWithdrawalsSummary
