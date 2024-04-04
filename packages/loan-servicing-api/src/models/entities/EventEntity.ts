import { LoanServicingEvent } from 'loan-servicing-common'
import { UntypedEventClass } from 'models/dtos/event'
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity()
@Unique('versionOfStream', ['streamId', 'streamVersion'])
class EventEntity<T extends LoanServicingEvent> implements UntypedEventClass {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  streamId!: string

  @Column()
  eventDate!: Date

  @Column()
  effectiveDate!: Date

  @Column()
  streamVersion!: number

  @Column({ type: 'nvarchar' })
  entityType!: T['entityType']

  @Column()
  isSoftDeleted!: boolean

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

  @Column()
  isApproved!: boolean
}

export default EventEntity
