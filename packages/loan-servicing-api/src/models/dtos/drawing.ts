import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsArray, IsDate, IsNotEmpty, ValidateNested } from 'class-validator'
import {
  AddWithdrawalToDrawingDto,
  Drawing,
  DrawingAccrual,
  Facility,
  NewDrawingRequestDto,
  RevertWithdrawlDto,
  UpdateDrawingInterestRequestDto,
} from 'loan-servicing-common'
import { Transform, Type } from 'class-transformer'
import { DrawingConfigurationDtoClass } from './drawingConfiguration'
import { DrawingAccrualDtoClass } from './drawingAccrual'

export class DrawingDtoClass implements Drawing {
  private readonly _type = 'DrawingDto'

  @ApiProperty()
  streamId!: string

  @ApiProperty()
  streamVersion!: number

  @ApiProperty()
  @Transform(({ value }) => ({ ...value, drawings: undefined }))
  facility!: Facility

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DrawingAccrualDtoClass)
  accruals!: DrawingAccrual[]

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
    'streamVersion',
    'interestAccrued',
    'outstandingPrincipal',
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
