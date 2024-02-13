import BaseEvent from 'models/events/BaseEvent'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
class Event<T extends BaseEvent> {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  streamId!: number

  @Column()
  streamVersion!: number

  // @Column()
  // type!: string

  // @Column()
  // typeVersion!: number

  @Column({ type: 'simple-json' })
  eventData!: T
}

export default Event
