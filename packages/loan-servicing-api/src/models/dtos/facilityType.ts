import { ApiProperty } from '@nestjs/swagger'
import {
  CalculateInterestStrategyName,
  FacilityFeeStrategyName,
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

  @ApiProperty()
  facilityFeeStrategies!: FacilityFeeStrategyName[]
}

export default FacilityTypeDtoClass
