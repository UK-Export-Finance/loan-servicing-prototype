import { NewFacilityRequestDto } from 'loan-servicing-common'
import { NewFacilityRequestFormDto } from 'templates/create-facility'
import { getDateFromDateInput } from 'utils/form-helpers'

const mapCreateFacilityFormToRequest = (
  request: NewFacilityRequestFormDto,
): NewFacilityRequestDto => ({
  ...request,
  facilityAmount: request.maxPrincipal,
  facilityConfig: {
    facilityFeesStrategies: [
      {
        name: 'AccruingFacilityFee',
        accruesOn: 'undrawnAmount',
        accrualRate: '2',
      },
      {
        name: 'AccruingFacilityFee',
        accruesOn: 'drawnAmount',
        accrualRate: '1',
      },
    ],
  },
  expiryDate: getDateFromDateInput(request, 'expiryDate'),
  issuedEffectiveDate: getDateFromDateInput(request, 'issuedEffectiveDate'),
})

export default mapCreateFacilityFormToRequest
