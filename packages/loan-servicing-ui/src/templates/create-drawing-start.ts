import {
  DrawingAccrualStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'

export type CreateDrawingStrategySelectNjkInput = {
  drawingAccrualStrategyNames: NunjuckSelectInputOption<DrawingAccrualStrategyName>[]
  repaymentStrategyNames: NunjuckSelectInputOption<RepaymentStrategyName>[]
  facilityId: string
}
