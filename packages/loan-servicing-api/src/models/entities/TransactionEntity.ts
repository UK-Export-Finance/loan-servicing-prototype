import { ClassAsJsonColumn, CurrencyColumn } from 'database/decorators'
import { DrawingProjectedEvent, Transaction } from 'loan-servicing-common'
import DrawingProjectionEventDtoClass from 'models/dtos/DrawingProjectedEventDto'
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
@Index(['streamId', 'datetime'])
class TransactionEntity implements Transaction {
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

  @Column()
  valueChanged!: string

  @CurrencyColumn()
  changeInValue!: string

  @CurrencyColumn()
  valueAfterTransaction!: string
}

export default TransactionEntity
