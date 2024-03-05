import {
  NewDrawingRequestDto,
  NewFacilityRequestDto,
} from 'loan-servicing-common'
import { NewFacilityRequestFormDto } from 'templates/create-facility'
import { getDateFromDateInput } from 'utils/form-helpers'
import mapRepaymentOptions from './repaymentOptionMappers'

const mapCreateFacilityFormToRequest = (
  request: NewFacilityRequestFormDto,
): NewFacilityRequestDto => ({
  ...request,
  facilityAmount: request.maxPrincipal,
  expiryDate: getDateFromDateInput(request, 'expiryDate'),
  issuedEffectiveDate: getDateFromDateInput(request, 'issuedEffectiveDate'),
})

export const mapCreateFacilityFormToCreateDrawing = (
  request: NewFacilityRequestFormDto,
): NewDrawingRequestDto => ({
  ...request,
  drawingConfig: {
    calculateInterestStrategy: {
      name: request.calculateInterestStrategy,
    },
    repaymentsStrategy: mapRepaymentOptions(request),
  },
  expiryDate: getDateFromDateInput(request, 'expiryDate'),
  issuedEffectiveDate: getDateFromDateInput(request, 'issuedEffectiveDate'),
})

export default mapCreateFacilityFormToRequest
