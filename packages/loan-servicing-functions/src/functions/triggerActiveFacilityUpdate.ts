import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
  output,
} from '@azure/functions'
import axios from 'axios'
import { Facility } from 'loan-servicing-common'

const queueOutput = output.storageQueue({
  queueName: 'facilityupdate',
  connection: 'StorageConnectionString',
})

async function triggerActiveFacilityUpdate(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`)
  context.log(`Getting system date from ${process.env.ApiUrl}/system/date`)
  const { data: systemDate } = await axios.get(
    `${process.env.ApiUrl}/system/date`,
  )
  const nextDay = new Date(new Date(systemDate).getTime() + 24 * 60 * 60 * 1000)
  await axios.put(`${process.env.ApiUrl}/system/date/${nextDay.toISOString()}`)
  const url = `${process.env.ApiUrl}/facility?isActive=true`

  const { data: activeFacilities } = await axios.get<Facility[]>(url)

  const messages = activeFacilities?.map((i) => i.streamId)

  context.extraOutputs.set(queueOutput, messages)

  return { body: 'Successfully queued all updates' }
}

app.http('triggerActiveFacilityUpdate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  extraOutputs: [queueOutput],
  handler: triggerActiveFacilityUpdate,
})

export default triggerActiveFacilityUpdate
