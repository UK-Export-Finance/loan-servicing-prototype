import { LoanServicingEvent, UntypedPendingEvent } from 'loan-servicing-common'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
class PendingEventEntity<T extends LoanServicingEvent>
  implements UntypedPendingEvent
{
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  streamId!: string

  @Column()
  eventDate!: Date

  @Column()
  dueDate!: Date

  @Column()
  notificationDate!: Date

  @Column()
  effectiveDate!: Date

  @Column({ type: 'nvarchar' })
  entityType!: T['entityType']

  @Column({ type: 'nvarchar' })
  type!: T['type']

  @Column({ type: 'int' })
  typeVersion!: T['typeVersion']

  @Column({
    type: 'simple-json',
  })
  eventData!: T['eventData']

  @Column()
  shouldProcessIfFuture!: boolean
}

export default PendingEventEntity
