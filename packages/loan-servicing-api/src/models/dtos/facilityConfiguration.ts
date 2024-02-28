import { ApiProperty } from '@nestjs/swagger'
import {
  CalculateInterestStrategyOption,
  FacilityConfiguration,
  RepaymentStrategyOptions,
} from 'loan-servicing-common'

// eslint-disable-next-line import/prefer-default-export
export class FacilityConfigurationDtoClass implements FacilityConfiguration {
  @ApiProperty()
  calculateInterestStrategy!: CalculateInterestStrategyOption

  @ApiProperty()
  repaymentsStrategy!: RepaymentStrategyOptions
}

