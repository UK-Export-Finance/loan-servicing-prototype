import { NotImplementedException } from '@nestjs/common'
import { RepaymentStrategyOptions } from 'loan-servicing-common'
import { NewFacilityRequestFormDto } from 'templates/create-facility'
import { getDateFromDateInput } from 'utils/form-helpers'

const mapRepaymentOptions = (
  createFacilityForm: NewFacilityRequestFormDto,
): RepaymentStrategyOptions => {
  switch (createFacilityForm.repaymentStrategy) {
    case 'Regular':
      return {
        name: createFacilityForm.repaymentStrategy,
        startDate: getDateFromDateInput(createFacilityForm, 'repaymentStartDate'),
        monthsBetweenRepayments: Number(createFacilityForm.repaymentInterval),
      }
    case 'Manual':
      return {
        name: createFacilityForm.repaymentStrategy,
        repayments: [],
      }
    default:
      throw new NotImplementedException()
  }
}

export default mapRepaymentOptions
