import { Transaction } from 'loan-servicing-common'
import { NunjuckTableRow } from 'types/nunjucks'
import { TransactionTableRow } from 'types/transactions'
import { buildNunjucksTableRow } from 'utils/nunjucks-parsers'

const getTransactionTableRow = (
  transaction: Transaction,
): TransactionTableRow => ({
  date: new Date(transaction.datetime).toLocaleDateString('en-GB'),
  reference: transaction.reference,
  transactionAmount:
    transaction.principalChange === '0'
      ? transaction.interestChange
      : transaction.principalChange,
  balance: transaction.balanceAfterTransaction,
  interestAccrued: transaction.interestAccrued,
})

const mapTransactionsToTable = (
  events: Transaction[],
): NunjuckTableRow[] =>
  events
    ?.map(getTransactionTableRow)
    .map((e) =>
      buildNunjucksTableRow(e, [
        'date',
        'reference',
        'transactionAmount',
        'balance',
        'interestAccrued',
      ]),
    ) || null

export default mapTransactionsToTable
