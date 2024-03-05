import { ArrayOfClassAsJsonColumn, CurrencyColumn } from 'database/decorators'
import { Drawing, Facility } from 'loan-servicing-common'
import { DrawingDtoClass } from 'models/dtos/drawing'
import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm'

@Entity()
class FacilityEntity implements Facility {
  @PrimaryColumn()
  streamId!: string

  @Column()
  streamVersion!: number

  @Column()
  facilityType!: string

  @ArrayOfClassAsJsonColumn(DrawingDtoClass)
  @OneToMany('DrawingEntity', 'facility', { cascade: true, eager: true })
  drawings!: Relation<Drawing>[]

  @Column()
  obligor!: string

  @CurrencyColumn()
  facilityAmount!: string

  @Column()
  issuedEffectiveDate!: Date

  @Column()
  expiryDate!: Date
}

export default FacilityEntity
