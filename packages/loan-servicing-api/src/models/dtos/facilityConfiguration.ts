import { ApiExtraModels, ApiProperty, OmitType, refs } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  AccruingFacilityFeeStrategyOption,
  AddAccruingFacilityFeeDto,
  AddFixedFacilityFeeDto,
  FacilityConfiguration,
  FacilityFeeStrategyName,
  FixedFacilityFeeStrategyOption,
} from 'loan-servicing-common'
import { IsArray, IsDate, ValidateNested } from 'class-validator'
import StrategyOptionDtoClass from './strategy-option'

const interestStrategyNames: FacilityFeeStrategyName[] = ['AccruingFacilityFee']

export class FacilityFeeStrategyOptionDtoClass {
  @ApiProperty({
    enum: interestStrategyNames,
  })
  name!: FacilityFeeStrategyName
}

export class FixedFacilityFeeStrategyOptionDtoClass
  extends StrategyOptionDtoClass
  implements FixedFacilityFeeStrategyOption
{
  @ApiProperty({ enum: ['FixedFacilityFee'] })
  name: 'FixedFacilityFee' = 'FixedFacilityFee'

  @ApiProperty()
  feeId!: string

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date!: Date

  @ApiProperty()
  feeAmount!: string
}

export class AddFixedFacilityFeeDtoClass
  extends OmitType(FixedFacilityFeeStrategyOptionDtoClass, ['feeId'])
  implements AddFixedFacilityFeeDto {}

export class AccruingFacilityFeeStrategyOptionDtoClass
  extends StrategyOptionDtoClass
  implements AccruingFacilityFeeStrategyOption
{
  @ApiProperty({ enum: ['AccruingFacilityFee'] })
  name: 'AccruingFacilityFee' = 'AccruingFacilityFee'

  @ApiProperty()
  feeId!: string

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  startsFrom!: Date

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  stopsOn!: Date

  @ApiProperty()
  accrualRate!: string

  @ApiProperty({ enum: ['facilityAmount', 'drawnAmount', 'undrawnAmount'] })
  accruesOn!: AccruingFacilityFeeStrategyOption['accruesOn']
}

export class AddAccruingFacilityFeeDtoClass
  extends OmitType(AccruingFacilityFeeStrategyOptionDtoClass, ['feeId'])
  implements AddAccruingFacilityFeeDto {}

@ApiExtraModels(
  AccruingFacilityFeeStrategyOptionDtoClass,
  FixedFacilityFeeStrategyOptionDtoClass,
)
export class FacilityConfigurationDtoClass implements FacilityConfiguration {
  @ApiProperty({
    oneOf: refs(
      AccruingFacilityFeeStrategyOptionDtoClass,
      FixedFacilityFeeStrategyOptionDtoClass,
    ),
  })
  @Type(() => StrategyOptionDtoClass, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'name',
      subTypes: [
        { value: AccruingFacilityFeeStrategyOptionDtoClass, name: 'Regular' },
        { value: FixedFacilityFeeStrategyOptionDtoClass, name: 'Manual' },
      ],
    },
  })
  @ValidateNested({ each: true })
  @IsArray()
  facilityFeesStrategies!: (
    | AccruingFacilityFeeStrategyOptionDtoClass
    | FixedFacilityFeeStrategyOptionDtoClass
  )[]
}
