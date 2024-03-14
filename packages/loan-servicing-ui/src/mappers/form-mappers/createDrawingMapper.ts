import { NewDrawingRequestDto } from 'loan-servicing-common'
import { getDateFromDateInput } from 'utils/form-helpers'
import { NewDrawingRequestFormDto } from 'templates/create-drawing'
import mapRepaymentOptions from './repaymentOptionMappers'

const mapCreateDrawingFormToRequest = (
  request: NewDrawingRequestFormDto,
): NewDrawingRequestDto => ({
  ...request,
  drawingConfig: {
    calculateInterestStrategy: {
      name: request.calculateInterestStrategy,
    },
    repaymentsStrategy: mapRepaymentOptions(request),
  },
  accruals: [],
  outstandingPrincipal: request.initialDrawnAmount,
  expiryDate: getDateFromDateInput(request, 'expiryDate'),
  issuedEffectiveDate: getDateFromDateInput(request, 'issuedEffectiveDate'),
})

export default mapCreateDrawingFormToRequest
