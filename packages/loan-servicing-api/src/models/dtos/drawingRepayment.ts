import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsNotEmpty } from 'class-validator'
import { RecordDrawingRepaymentDto, Repayment } from 'loan-servicing-common'

// eslint-disable-next-line import/prefer-default-export
export class DrawingRepaymentDto implements Repayment {
  @ApiProperty()
  id!: string

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date!: Date

  @ApiProperty()
  expectedAmount!: string

  @ApiProperty()
  paidAmount!: string

  @ApiProperty()
  settled!: boolean
}

export class RecordDrawingRepaymentDtoClass
  implements RecordDrawingRepaymentDto
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
  repaymentId!: string
}
