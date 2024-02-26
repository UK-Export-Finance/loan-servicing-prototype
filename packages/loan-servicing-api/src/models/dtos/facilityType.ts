import { ApiProperty } from '@nestjs/swagger'
import {
  CalculateInterestStrategyName,
  FacilityType,
} from 'loan-servicing-common'

class FacilityTypeDtoClass implements FacilityType {
  @ApiProperty()
  name!: string

  @ApiProperty()
  calculateInterestStrategy!: CalculateInterestStrategyName
}

export default FacilityTypeDtoClass
