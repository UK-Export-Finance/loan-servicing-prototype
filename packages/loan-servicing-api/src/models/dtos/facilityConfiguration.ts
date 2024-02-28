import { ApiProperty } from '@nestjs/swagger'
import {
  CalculateInterestStrategyOption,
  FacilityConfiguration,
} from 'loan-servicing-common'

// eslint-disable-next-line import/prefer-default-export
export class FacilityConfigurationDtoClass implements FacilityConfiguration {
  @ApiProperty()
  calculateInterestStrategy!: CalculateInterestStrategyOption
}

