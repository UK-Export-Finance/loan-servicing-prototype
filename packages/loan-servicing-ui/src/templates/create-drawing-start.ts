import {
  CalculateInterestStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'

export type CreateDrawingStrategySelectNjkInput = {
  calculateInterestStrategyNames: NunjuckSelectInputOption<CalculateInterestStrategyName>[]
  repaymentStrategyNames: NunjuckSelectInputOption<RepaymentStrategyName>[]
  facilityId: string
}
