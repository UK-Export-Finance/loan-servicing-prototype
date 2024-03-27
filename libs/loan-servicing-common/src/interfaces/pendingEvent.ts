import { UntypedEvent } from './events/eventBase'

export type PendingEvent<T extends UntypedEvent> = Omit<
  T,
  'streamVersion' | 'isSoftDeleted'
> & {
  dueDate: Date
  notificationDate: Date
}

export type NotificationText = {
  type: string
  text: string
}

export type UntypedPendingEvent = PendingEvent<UntypedEvent>
