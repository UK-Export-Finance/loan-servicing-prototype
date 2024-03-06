import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsDate, IsNotEmpty, ValidateNested } from 'class-validator'
import {
  AddWithdrawalToDrawingDto,
  Drawing,
  Facility,
  NewDrawingRequestDto,
  RevertWithdrawlDto,
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
  facilityStreamId!: string

  @ApiProperty()
  facility!: Facility

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
    'facilityStreamId',
    'facility',
  ])
  implements NewDrawingRequestDto
{
  facilityId!: string
}

export class UpdateInterestRequestDtoClass
  implements UpdateDrawingInterestRequestDto
{
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

export class RevertWithdrawalDtoClass implements RevertWithdrawlDto {
  @ApiProperty()
  drawingStreamId!: string

  @ApiProperty()
  withdrawalEventStreamVersion!: number

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  dateOfWithdrawal!: Date
}
