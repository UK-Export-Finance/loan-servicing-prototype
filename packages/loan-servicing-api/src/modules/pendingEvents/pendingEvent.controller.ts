import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { NotificationText } from 'loan-servicing-common'
import PendingEventService from './pendingEvent.service'

@ApiTags('PendingEvent')
@Controller('/pending-event')
class PendingEventController {
  constructor(private pendingEventService: PendingEventService) {}

  @Get('today')
  async getTodaysNotifications(): Promise<NotificationText[]> {
    const result =
      await this.pendingEventService.getEventsWithNotificationsToday()

    return Promise.all(
      result.map((r) =>
        this.pendingEventService.mapPendingEventToNotification(r),
      ),
    )
  }
}

export default PendingEventController
