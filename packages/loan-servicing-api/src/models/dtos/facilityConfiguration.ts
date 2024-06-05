import { ApiExtraModels, ApiProperty, OmitType, refs } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  AccruingFacilityFeeStrategyOption,
  AddAccruingFacilityFeeDto,
  AddFixedFacilityFeeDto,
  FacilityFee,
  FacilityFeeStrategyName,
  FixedFacilityFeeStrategyOption,
  ParticipationProperties,
} from 'loan-servicing-common'
import { IsArray, IsDate, ValidateNested } from 'class-validator'
import StrategyOptionDtoClass from './strategy-option'

const interestStrategyNames: FacilityFeeStrategyName[] = ['AccruingFacilityFee']

export class ParticpationPropertiesDtoClass implements ParticipationProperties {
  parentFacilityId!: string

  participantShare!: string
}

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
  effectiveDate!: Date

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
  effectiveDate!: Date

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  expiryDate!: Date

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
export class FacilityFeeDtoClass implements FacilityFee {
  @ApiProperty()
  id!: string

  @ApiProperty()
  balance!: string

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
  config!:
    | AccruingFacilityFeeStrategyOptionDtoClass
    | FixedFacilityFeeStrategyOptionDtoClass
}
