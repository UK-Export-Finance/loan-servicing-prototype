import { ArrayOfClassAsJsonColumn, CurrencyColumn } from 'database/decorators'
import { Facility } from 'loan-servicing-common'
import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm'
import { DrawingDtoClass } from 'models/dtos/drawing'
import type DrawingEntity from './DrawingEntity'

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
  drawings!: Relation<DrawingEntity>[]

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
