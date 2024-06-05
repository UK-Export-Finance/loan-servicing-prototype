import { ArrayOfClassAsJsonColumn, CurrencyColumn } from 'database/decorators'
import { Facility, FacilityFee, FacilityHierarchy } from 'loan-servicing-common'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Relation,
} from 'typeorm'
import { FacilityFeeDtoClass } from 'models/dtos/facilityConfiguration'
import type DrawingEntity from './DrawingEntity'

@Entity()
class FacilityEntity implements Facility {
  @PrimaryColumn()
  streamId!: string

  @Column()
  streamVersion!: number

  @Column()
  facilityType!: string

  @Column()
  hierarchyType!: FacilityHierarchy

  @ManyToOne(() => FacilityEntity, (e) => e.participations)
  parentFacility?: Relation<FacilityEntity>

  @OneToMany(() => FacilityEntity, (e) => e.parentFacility)
  participations!: Relation<FacilityEntity>[]

  @OneToMany('DrawingEntity', 'facility', { cascade: true, eager: true })
  drawings!: Relation<DrawingEntity>[]

  @Column()
  obligor!: string

  @CurrencyColumn()
  facilityAmount!: string

  @CurrencyColumn()
  drawnAmount!: string

  @CurrencyColumn()
  undrawnAmount!: string

  @ArrayOfClassAsJsonColumn(FacilityFeeDtoClass)
  facilityFees!: FacilityFee[]

  @Column()
  issuedEffectiveDate!: Date

  @Column()
  expiryDate!: Date

  @Column()
  currentDate!: Date
}

export default FacilityEntity
