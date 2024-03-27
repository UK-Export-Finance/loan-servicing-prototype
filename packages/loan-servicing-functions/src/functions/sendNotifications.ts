import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import axios from 'axios'
import { NotificationText } from 'loan-servicing-common'

async function sendNotifications(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`)

  const { data: notifications } = await axios.get<NotificationText[]>(
    `${process.env.ApiUrl}/pending-event/today`,
  )

  await Promise.all(
    notifications.map((n) =>
      axios.post(process.env.SLACK_WEBHOOK_URL, n, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    ),
  )

  return { body: 'Success' }
}

app.http('sendNotifications', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: sendNotifications,
})

export default sendNotifications
