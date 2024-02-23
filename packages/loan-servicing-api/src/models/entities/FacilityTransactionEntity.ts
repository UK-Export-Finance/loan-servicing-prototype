import { FacilityTransaction } from 'loan-servicing-common'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
class FacilityTransactionEntity implements FacilityTransaction {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  streamId!: string

  @Column()
  datetime!: Date

  @Column()
  reference!: string

  @Column()
  transactionAmount!: string

  @Column()
  interestAccrued!: string;

  @Column()
  balanceAfterTransaction!: string
}

export default FacilityTransactionEntity
