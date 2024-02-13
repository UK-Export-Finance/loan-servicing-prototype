import Facility from 'models/interfaces/facility'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
class FacilityEntity implements Facility {
  @PrimaryColumn()
  streamId!: number

  @Column()
  obligor!: string

  // @Column()
  // facilityType!: string

  // @Column()
  // description!: string

  // @Column()
  // currency!: string

  // @Column()
  // facilityAmount!: number

  // @Column()
  // commitmentDate!: Date

  // @Column()
  // issuedNotEffectiveDate!: Date

  // @Column()
  // issuedEffectiveDate!: Date

  // @Column()
  // availabilityDate!: Date

  // @Column()
  // expiryDate!: Date

  // @Column()
  // usedAmount!: number

  // @Column()
  // availableAmount!: number
}

export default FacilityEntity
