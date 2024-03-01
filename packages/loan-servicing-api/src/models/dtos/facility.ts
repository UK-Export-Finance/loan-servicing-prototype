import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsDate, IsNotEmpty, ValidateNested } from 'class-validator'
import {
  AdjustFacilityPrincipalDto,
  Facility,
  NewFacilityRequestDto,
  UpdateInterestRequestDto,
} from 'loan-servicing-common'
import { Type } from 'class-transformer'
import { FacilityConfigurationDtoClass } from './facilityConfiguration'

export class FacilityResponseDtoClass implements Facility {
  @ApiProperty()
  streamId!: string

  @ApiProperty()
  streamVersion!: number

  @ApiProperty()
  @IsNotEmpty()
  facilityType!: string

  @ApiProperty()
  @ValidateNested()
  @Type(() => FacilityConfigurationDtoClass)
  facilityConfig!: FacilityConfigurationDtoClass

  @ApiProperty()
  @IsNotEmpty()
  obligor!: string

  @ApiProperty()
  @IsNotEmpty()
  facilityAmount!: string

  @ApiProperty()
  @IsNotEmpty()
  interestAccrued!: string

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  issuedEffectiveDate!: Date

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  expiryDate!: Date

  @ApiProperty()
  @IsNotEmpty()
  interestRate!: string
}

export class NewFacilityRequestDtoClass
  extends OmitType(FacilityResponseDtoClass, [
    'streamId',
    'streamVersion',
    'interestAccrued',
  ])
  implements NewFacilityRequestDto {}

export class UpdateInterestRequestDtoClass implements UpdateInterestRequestDto {
  @ApiProperty()
  effectiveDate!: string

  @ApiProperty()
  @IsNotEmpty()
  interestRate!: string
}

export class AdjustFacilityPrincipalDtoClass
  implements AdjustFacilityPrincipalDto
{
  @ApiProperty()
  effectiveDate!: string

  @ApiProperty()
  adjustment!: string
}
