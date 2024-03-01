import { ApiExtraModels, ApiProperty, refs } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator'
import {
  CalculateInterestStrategyName,
  FacilityConfiguration,
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
  implements RegularRepaymentStrategyOptions
{
  @ApiProperty({ enum: ['Regular'] })
  name: 'Regular' = 'Regular'

  @ApiProperty()
  startDate!: Date

  @ApiProperty()
  monthsBetweenRepayments!: string
}

export class RepaymentDtoClass implements Repayment {
  @ApiProperty()
  date!: Date

  @ApiProperty()
  amount!: string
}
@ApiExtraModels(RepaymentDtoClass)
export class ManualRepaymentStrategyOptionsDtoClass
  implements ManualRepaymentStrategyOptions
{
  @ApiProperty({ enum: ['Manual'] })
  name: 'Manual' = 'Manual'

  @ApiProperty({ type: () => [RepaymentDtoClass]})
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  repayments!: RepaymentDtoClass[]
}

@ApiExtraModels(
  // RegularRepaymentStrategyOptionsDtoClass,
  ManualRepaymentStrategyOptionsDtoClass,
)
export class FacilityConfigurationDtoClass implements FacilityConfiguration {
  @ApiProperty()
  calculateInterestStrategy!: CalculateInterestStrategyOptionDtoClass

  @ApiProperty({
    oneOf: refs(
      // RegularRepaymentStrategyOptionsDtoClass,
      ManualRepaymentStrategyOptionsDtoClass,
    ),
  })
  @Type(() => StrategyOptionDtoClass, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'name',
      subTypes: [
        // { value: RegularRepaymentStrategyOptionsDtoClass, name: 'Regular' },
        { value: ManualRepaymentStrategyOptionsDtoClass, name: 'Manual' },
      ],
    },
  })
  repaymentsStrategy!:
    | RegularRepaymentStrategyOptionsDtoClass
    | ManualRepaymentStrategyOptionsDtoClass
}
