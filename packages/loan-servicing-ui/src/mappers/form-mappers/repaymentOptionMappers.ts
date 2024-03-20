import { BadRequestException, NotImplementedException } from '@nestjs/common'
import { RepaymentStrategyOptions } from 'loan-servicing-common'
import {
  NewDrawingRequestFormDto,
  PermittedRepaymentNumbers,
} from 'templates/create-drawing'
import { getDateFromDateInput } from 'utils/form-helpers'

const mapRepaymentOptions = (
  createFacilityForm: NewDrawingRequestFormDto,
): RepaymentStrategyOptions => {
  switch (createFacilityForm.repaymentStrategy) {
    case 'Regular':
      if (!createFacilityForm.repaymentInterval) {
        throw new BadRequestException('No value found for repayment interval')
      }
      return {
        name: createFacilityForm.repaymentStrategy,
        startDate: getDateFromDateInput(
          createFacilityForm,
          'repaymentStartDate',
        ),
        monthsBetweenRepayments: createFacilityForm.repaymentInterval,
      }
    case 'Manual':
      const repaymentNumbers: PermittedRepaymentNumbers[] = [
        '1',
        '2',
        '3',
        '4',
        '5',
      ]

      const repayments = repaymentNumbers
        .map((number) => {
          const amount = createFacilityForm[`repaymentAmount${number}`]
          return amount
            ? {
                date: getDateFromDateInput(
                  createFacilityForm,
                  `repaymentDate${number}`,
                ),
                expectedAmount: createFacilityForm[`repaymentAmount${number}`]!,
              }
            : undefined
        })
        .filter((repayment) => repayment)
        .map((r) => r!)

      return {
        name: createFacilityForm.repaymentStrategy,
        repayments,
      }
    default:
      throw new NotImplementedException()
  }
}

export default mapRepaymentOptions
