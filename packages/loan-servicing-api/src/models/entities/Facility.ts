import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
class Facility {
  @PrimaryGeneratedColumn()
  id!: number

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

export default Facility
