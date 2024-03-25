import { ApiExtraModels, ApiProperty, OmitType, refs } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  AddFixedDrawingAccrualDto,
  AddMarketDrawingAccrualDto,
  DrawingAccrual,
  DrawingAccrualStrategyName,
  FixedDrawingAccrualStrategyOption,
  MarketDrawingAccrualStrategyOption,
  RecordDrawingAccrualPaymentDto,
} from 'loan-servicing-common'
import { IsArray, IsDate, IsNotEmpty, ValidateNested } from 'class-validator'
import StrategyOptionDtoClass from './strategy-option'

const interestStrategyNames: DrawingAccrualStrategyName[] = [
  'FixedDrawingAccrual',
  'MarketDrawingAccrual',
]

export class DrawingAccrualStrategyOptionDtoClass {
  @ApiProperty({
    enum: interestStrategyNames,
  })
  name!: DrawingAccrualStrategyName
}

export class FixedDrawingAccrualStrategyOptionDtoClass
  extends StrategyOptionDtoClass
  implements FixedDrawingAccrualStrategyOption
{
  @ApiProperty({ enum: ['FixedDrawingAccrual'] })
  name: 'FixedDrawingAccrual' = 'FixedDrawingAccrual'

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

  @ApiProperty()
  monthsBetweenPayment!: number
}

export class AddFixedDrawingAccrualDtoClass
  extends OmitType(FixedDrawingAccrualStrategyOptionDtoClass, [
    'accrualId',
    'name',
  ])
  implements AddFixedDrawingAccrualDto {}

export class MarketDrawingAccrualStrategyOptionDtoClass
  extends StrategyOptionDtoClass
  implements MarketDrawingAccrualStrategyOption
{
  @ApiProperty({ enum: ['MarketDrawingAccrual'] })
  name: 'MarketDrawingAccrual' = 'MarketDrawingAccrual'

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

  @ApiProperty()
  monthsBetweenPayment!: number
}

export class AddMarketDrawingAccrualDtoClass
  extends OmitType(MarketDrawingAccrualStrategyOptionDtoClass, [
    'accrualId',
    'name',
  ])
  implements AddMarketDrawingAccrualDto {}

@ApiExtraModels(
  MarketDrawingAccrualStrategyOptionDtoClass,
  FixedDrawingAccrualStrategyOptionDtoClass,
)
export class DrawingAccrualDtoClass implements DrawingAccrual {
  @ApiProperty()
  id!: string

  @ApiProperty()
  accruedFee!: string

  @ApiProperty()
  predictedFinalFee!: string

  @ApiProperty()
  paidAmount!: string

  @ApiProperty()
  isSettled!: boolean

  @ApiProperty({
    oneOf: refs(
      MarketDrawingAccrualStrategyOptionDtoClass,
      FixedDrawingAccrualStrategyOptionDtoClass,
    ),
  })
  @Type(() => StrategyOptionDtoClass, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'name',
      subTypes: [
        {
          value: MarketDrawingAccrualStrategyOptionDtoClass,
          name: 'Regular',
        },
        {
          value: FixedDrawingAccrualStrategyOptionDtoClass,
          name: 'Manual',
        },
      ],
    },
  })
  @ValidateNested({ each: true })
  @IsArray()
  config!:
    | MarketDrawingAccrualStrategyOptionDtoClass
    | FixedDrawingAccrualStrategyOptionDtoClass
}

export class RecordDrawingAccrualPaymentDtoClass
  implements RecordDrawingAccrualPaymentDto
{
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date!: Date

  @ApiProperty()
  @IsNotEmpty()
  amount!: string

  @ApiProperty()
  @IsNotEmpty()
  accrualId!: string
}
