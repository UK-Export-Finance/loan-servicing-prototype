import { CurrencyColumn } from 'database/decorators'
import { FacilityTransaction } from 'loan-servicing-common'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
@Index(['streamId', 'datetime'])
class FacilityTransactionEntity implements FacilityTransaction {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  streamId!: string

  @Column()
  datetime!: Date

  @Column()
  reference!: string

  @CurrencyColumn()
  principalChange!: string

  @CurrencyColumn()
  interestChange!: string

  @CurrencyColumn()
  interestAccrued!: string

  @CurrencyColumn()
  balanceAfterTransaction!: string
}

export default FacilityTransactionEntity
