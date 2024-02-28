import { ApiProperty } from '@nestjs/swagger'
import {
  CalculateInterestStrategyName,
  FacilityType,
  RepaymentStrategyName,
} from 'loan-servicing-common'

class FacilityTypeDtoClass implements FacilityType {
  @ApiProperty()
  name!: string

  @ApiProperty()
  interestStrategies!: CalculateInterestStrategyName[]

  @ApiProperty()
  repaymentsStrategies!: RepaymentStrategyName[]
}

export default FacilityTypeDtoClass
