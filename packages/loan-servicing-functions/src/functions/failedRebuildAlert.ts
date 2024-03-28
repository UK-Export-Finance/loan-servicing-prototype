import {
  app,
  HttpResponseInit,
} from '@azure/functions'
import axios from 'axios'

async function failedRebuildAlert(
  failedRequest: string,
): Promise<HttpResponseInit> {
  const facilityUrl = `${process.env.UI_URL}/facility/${failedRequest}`
  const message = {
    type: 'mrkdwn',
    text: `ERROR: Daily event processing for <${facilityUrl}|facility ${failedRequest}> failed`,
  }

  await axios.post(process.env.SLACK_WEBHOOK_URL, message, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return { body: 'Success' }
}

app.storageQueue('failedRebuildAlert', {
  queueName: 'facilityupdate-poison',
  connection: 'StorageConnectionString',
  handler: failedRebuildAlert,
})

export default failedRebuildAlert
