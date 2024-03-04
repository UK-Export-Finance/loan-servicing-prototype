import { ClassAsJsonColumn, CurrencyColumn } from 'database/decorators'
import { Drawing, DrawingConfiguration } from 'loan-servicing-common'
import { DrawingConfigurationDtoClass } from 'models/dtos/facilityConfiguration'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
class DrawingEntity implements Drawing {
  @PrimaryColumn()
  streamId!: string

  @Column()
  streamVersion!: number

  @Column()
  facilityId!: string

  @ClassAsJsonColumn(DrawingConfigurationDtoClass)
  drawingConfig!: DrawingConfiguration

  @CurrencyColumn()
  outstandingPrincipal!: string

  @CurrencyColumn()
  interestAccrued: string = '0'

  @Column()
  interestRate!: string

  @Column()
  issuedEffectiveDate!: Date

  @Column()
  expiryDate!: Date
}

export default DrawingEntity
