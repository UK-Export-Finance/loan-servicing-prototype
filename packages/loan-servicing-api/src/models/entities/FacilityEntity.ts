import {
  ArrayOfClassAsJsonColumn,
  CurrencyColumn,
} from 'database/decorators'
import {
  Drawing,
  Facility,
  FacilityFee,
  FacilityHierarchy,
  ParticpationProperties,
} from 'loan-servicing-common'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Relation,
} from 'typeorm'
import {
  FacilityFeeDtoClass,
  ParticpationPropertiesDtoClass,
} from 'models/dtos/facilityConfiguration'

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
  parentFacility?: Relation<Facility>

  @OneToMany(() => FacilityEntity, (e) => e.parentFacility)
  participations!: Relation<Facility>[]

  @ArrayOfClassAsJsonColumn(ParticpationPropertiesDtoClass)
  participationsConfig!: ParticpationProperties[]

  @OneToMany('DrawingEntity', 'facility', { cascade: true, eager: true })
  drawings!: Relation<Drawing>[]

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
