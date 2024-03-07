import { ClassAsJsonColumn, CurrencyColumn } from 'database/decorators'
import { DrawingProjectedEvent, Transaction } from 'loan-servicing-common'
import DrawingProjectionEventDtoClass from 'models/dtos/DrawingProjectedEventDto'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
@Index(['streamId', 'datetime'])
class DrawingTransactionEntity implements Transaction {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  streamId!: string

  @ClassAsJsonColumn(DrawingProjectionEventDtoClass)
  sourceEvent!: DrawingProjectedEvent;

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

export default DrawingTransactionEntity
