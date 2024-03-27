import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import axios from 'axios'

// const queueOutput = output.storageQueue({
//   queueName: 'facilityupdate',
//   connection: 'StorageConnectionString',
// })

async function sendNotifications(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`)
  await axios.post(
    process.env.SLACK_WEBHOOK_URL,
    { text: 'Test post hello' },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return { body: 'Success' }
}

app.http('sendNotifications', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: sendNotifications,
})

export default sendNotifications
