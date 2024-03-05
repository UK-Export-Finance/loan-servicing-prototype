import { DrawingDto } from 'loan-servicing-common'
import { GovUkSummaryListProps } from 'types/nunjucks'

export type DrawingNjkInput = {
  drawing: DrawingDto
  drawingCreated?: boolean
  eventRows: object
  transactionRows: object
  drawingSummaryListProps: GovUkSummaryListProps
  // withdrawalsSummaryProps: GovUkSummaryListProps
}
