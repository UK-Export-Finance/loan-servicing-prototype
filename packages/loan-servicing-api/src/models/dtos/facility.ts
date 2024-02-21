import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'
import {
  AdjustFacilityPrincipalDto,
  Facility,
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
  obligor!: string

  @ApiProperty()
  @IsNotEmpty()
  facilityAmount!: number

  @ApiProperty()
  issuedEffectiveDate!: Date

  @ApiProperty()
  expiryDate!: Date

  @ApiProperty()
  @IsNotEmpty()
  interestRate!: number
}

export class NewFacilityRequestDtoClass
  extends OmitType(FacilityResponseDtoClass, ['streamId', 'streamVersion'])
  implements NewFacilityRequestDto {}

export class UpdateInterestRequestDtoClass implements UpdateInterestRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  newInterestRate!: number
}

export class AdjustFacilityPrincipalDtoClass
  implements AdjustFacilityPrincipalDto
{
  @ApiProperty()
  effectiveDate!: string

  @ApiProperty()
  adjustment!: number
}
