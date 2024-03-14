import { ApiExtraModels, ApiProperty, OmitType, refs } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  AddFixedLoanInterestAccrualDto,
  AddMarketLoanInterestAccrualDto,
  DrawingAccrual,
  DrawingAccrualStrategyName,
  FixedLoanInterestAccrualStrategyOption,
  MarketLoanInterestAccrualStrategyOption,
} from 'loan-servicing-common'
import { IsArray, IsDate, ValidateNested } from 'class-validator'
import StrategyOptionDtoClass from './strategy-option'

const interestStrategyNames: DrawingAccrualStrategyName[] = [
  'FixedLoanInterestAccrual',
  'MarketLoanInterestAccrual',
]

export class DrawingAccrualStrategyOptionDtoClass {
  @ApiProperty({
    enum: interestStrategyNames,
  })
  name!: DrawingAccrualStrategyName
}

export class FixedLoanInterestAccrualStrategyOptionDtoClass
  extends StrategyOptionDtoClass
  implements FixedLoanInterestAccrualStrategyOption
{
  @ApiProperty({ enum: ['FixedLoanInterestAccrual'] })
  name: 'FixedLoanInterestAccrual' = 'FixedLoanInterestAccrual'

  @ApiProperty()
  accrualId!: string

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
}

export class AddFixedLoanInterestAccrualDtoClass
  extends OmitType(FixedLoanInterestAccrualStrategyOptionDtoClass, [
    'accrualId',
  ])
  implements AddFixedLoanInterestAccrualDto {}

export class MarketLoanInterestAccrualStrategyOptionDtoClass
  extends StrategyOptionDtoClass
  implements MarketLoanInterestAccrualStrategyOption
{
  @ApiProperty({ enum: ['MarketLoanInterestAccrual'] })
  name: 'MarketLoanInterestAccrual' = 'MarketLoanInterestAccrual'

  @ApiProperty()
  accrualId!: string

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  effectiveDate!: Date

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  expiryDate!: Date

  @ApiProperty()
  isNotional!: boolean

  @ApiProperty()
  accrualRate!: string
}

export class AddMarketLoanInterestAccrualDtoClass
  extends OmitType(MarketLoanInterestAccrualStrategyOptionDtoClass, [
    'accrualId',
    'isNotional',
  ])
  implements AddMarketLoanInterestAccrualDto {}

@ApiExtraModels(
  MarketLoanInterestAccrualStrategyOptionDtoClass,
  FixedLoanInterestAccrualStrategyOptionDtoClass,
)
export class DrawingAccrualDtoClass implements DrawingAccrual {
  @ApiProperty()
  id!: string

  @ApiProperty()
  balance!: string

  @ApiProperty({
    oneOf: refs(
      MarketLoanInterestAccrualStrategyOptionDtoClass,
      FixedLoanInterestAccrualStrategyOptionDtoClass,
    ),
  })
  @Type(() => StrategyOptionDtoClass, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'name',
      subTypes: [
        {
          value: MarketLoanInterestAccrualStrategyOptionDtoClass,
          name: 'Regular',
        },
        {
          value: FixedLoanInterestAccrualStrategyOptionDtoClass,
          name: 'Manual',
        },
      ],
    },
  })
  @ValidateNested({ each: true })
  @IsArray()
  config!:
    | MarketLoanInterestAccrualStrategyOptionDtoClass
    | FixedLoanInterestAccrualStrategyOptionDtoClass
}
