import { Transaction } from 'loan-servicing-common'
import { NunjuckTableRow } from 'types/nunjucks'
import { TransactionTableRow } from 'types/transactions'
import { buildNunjucksTableRow } from 'utils/nunjucks-parsers'

const getTransactionTableRow = (
  transaction: Transaction,
): TransactionTableRow => ({
  date: new Date(transaction.datetime).toLocaleDateString('en-GB'),
  reference: transaction.reference,
  valueChanged: transaction.valueChanged,
  transactionAmount:
    transaction.changeInValue === '0'
      ? transaction.changeInValue
      : transaction.changeInValue,
  newValue: transaction.valueAfterTransaction,
})

const mapTransactionsToTable = (events: Transaction[]): NunjuckTableRow[] =>
  events
    ?.map(getTransactionTableRow)
    .map((e) =>
      buildNunjucksTableRow(e, [
        'date',
        'reference',
        'valueChanged',
        'transactionAmount',
        'newValue',
      ]),
    ) || null

export default mapTransactionsToTable
