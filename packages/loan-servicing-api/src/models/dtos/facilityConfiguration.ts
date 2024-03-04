import { ApiExtraModels, ApiProperty, refs } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator'
import {
  CalculateInterestStrategyName,
  DrawingConfiguration,
  ManualRepaymentStrategyOptions,
  RegularRepaymentStrategyOptions,
  Repayment,
} from 'loan-servicing-common'

const interestStrategyNames: CalculateInterestStrategyName[] = [
  'Compounding',
  'NoInterest',
  'PrincipalOnly',
]

class StrategyOptionDtoClass {
  name!: string
}

export class CalculateInterestStrategyOptionDtoClass {
  @ApiProperty({
    enum: interestStrategyNames,
  })
  name!: CalculateInterestStrategyName
}

export class RegularRepaymentStrategyOptionsDtoClass
  extends StrategyOptionDtoClass
  implements RegularRepaymentStrategyOptions
{
  @ApiProperty({ enum: ['Regular'] })
  name: 'Regular' = 'Regular'

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  startDate!: Date

  @ApiProperty()
  monthsBetweenRepayments!: string
}

export class RepaymentDtoClass implements Repayment {
  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date!: Date

  @ApiProperty()
  @IsNotEmpty()
  amount!: string
}
@ApiExtraModels(RepaymentDtoClass)
export class ManualRepaymentStrategyOptionsDtoClass
  extends StrategyOptionDtoClass
  implements ManualRepaymentStrategyOptions
{
  @ApiProperty({ enum: ['Manual'] })
  @IsNotEmpty()
  name: 'Manual' = 'Manual'

  @ApiProperty({ type: () => [RepaymentDtoClass] })
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepaymentDtoClass)
  @IsNotEmpty()
  repayments!: RepaymentDtoClass[]
}

@ApiExtraModels(
  RegularRepaymentStrategyOptionsDtoClass,
  ManualRepaymentStrategyOptionsDtoClass,
)
export class DrawingConfigurationDtoClass implements DrawingConfiguration {
  @ApiProperty()
  @Type(() => CalculateInterestStrategyOptionDtoClass)
  calculateInterestStrategy!: CalculateInterestStrategyOptionDtoClass

  @ApiProperty({
    oneOf: refs(
      RegularRepaymentStrategyOptionsDtoClass,
      ManualRepaymentStrategyOptionsDtoClass,
    ),
  })
  @Type(() => StrategyOptionDtoClass, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'name',
      subTypes: [
        { value: RegularRepaymentStrategyOptionsDtoClass, name: 'Regular' },
        { value: ManualRepaymentStrategyOptionsDtoClass, name: 'Manual' },
      ],
    },
  })
  @ValidateNested()
  repaymentsStrategy!:
    | RegularRepaymentStrategyOptionsDtoClass
    | ManualRepaymentStrategyOptionsDtoClass
}
