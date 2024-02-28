import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import {
  AdjustFacilityPrincipalDto,
  Facility,
  FacilityConfiguration,
  NewFacilityRequestDto,
  UpdateInterestRequestDto,
} from 'loan-servicing-common'

export class FacilityResponseDtoClass implements Facility {
  @ApiProperty()
  streamId!: string

  @ApiProperty()
  streamVersion!: number

  @ApiProperty()
  @IsNotEmpty()
  facilityType!: string

  @ApiProperty()
  @IsNotEmpty()
  facilityConfig!: FacilityConfiguration

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
  issuedEffectiveDate!: Date

  @ApiProperty()
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
