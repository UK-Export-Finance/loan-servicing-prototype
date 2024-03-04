import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsDate, IsNotEmpty, ValidateNested } from 'class-validator'
import {
  AddWithdrawalToDrawingDto,
  Drawing,
  NewDrawingRequestDto,
  UpdateDrawingInterestRequestDto,
} from 'loan-servicing-common'
import { Type } from 'class-transformer'
import { DrawingConfigurationDtoClass } from './facilityConfiguration'

export class DrawingDtoClass implements Drawing {
  @ApiProperty()
  streamId!: string

  @ApiProperty()
  streamVersion!: number

  @ApiProperty()
  facilityId!: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => DrawingConfigurationDtoClass)
  drawingConfig!: DrawingConfigurationDtoClass

  @ApiProperty()
  @IsNotEmpty()
  outstandingPrincipal!: string

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

export class NewDrawingRequestDtoClass
  extends OmitType(DrawingDtoClass, [
    'streamId',
    'streamVersion',
    'interestAccrued',
    'outstandingPrincipal',
  ])
  implements NewDrawingRequestDto {}

export class UpdateInterestRequestDtoClass implements UpdateDrawingInterestRequestDto {
  @ApiProperty()
  effectiveDate!: string

  @ApiProperty()
  @IsNotEmpty()
  interestRate!: string
}

export class AddWithdrawalToDrawingDtoClass
  implements AddWithdrawalToDrawingDto
{
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date!: Date

  @ApiProperty()
  amount!: string
}
