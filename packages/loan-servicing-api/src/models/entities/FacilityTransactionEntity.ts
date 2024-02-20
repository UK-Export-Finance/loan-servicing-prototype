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

  @Column('decimal', { precision: 10, scale: 2 })
  transactionAmount!: number

  @Column('decimal', { precision: 10, scale: 2 })
  balanceAfterTransaction!: number
}

export default FacilityTransactionEntity
