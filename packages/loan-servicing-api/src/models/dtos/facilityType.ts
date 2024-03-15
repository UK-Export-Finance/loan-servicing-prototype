import { ApiProperty } from '@nestjs/swagger'
import {
  DrawingAccrualStrategyName,
  FacilityFeeStrategyName,
  FacilityType,
  RepaymentStrategyName,
} from 'loan-servicing-common'

class FacilityTypeDtoClass implements FacilityType {
  @ApiProperty()
  name!: string

  @ApiProperty()
  drawingAccrualStrategies!: DrawingAccrualStrategyName[]

  @ApiProperty()
  repaymentsStrategies!: RepaymentStrategyName[]

  @ApiProperty()
  facilityFeeStrategies!: FacilityFeeStrategyName[]
}

export default FacilityTypeDtoClass
