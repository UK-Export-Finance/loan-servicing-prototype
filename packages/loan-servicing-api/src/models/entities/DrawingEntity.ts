import { ClassAsJsonColumn, CurrencyColumn } from 'database/decorators'
import { Drawing, DrawingConfiguration } from 'loan-servicing-common'
import { DrawingConfigurationDtoClass } from 'models/dtos/drawingConfiguration'
import { Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm'
import type FacilityEntity from './FacilityEntity'

@Entity()
class DrawingEntity implements Drawing {
  @PrimaryColumn()
  streamId!: string

  @Column()
  streamVersion!: number

  @ManyToOne('FacilityEntity', 'drawings')
  facility!: Relation<FacilityEntity>

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
