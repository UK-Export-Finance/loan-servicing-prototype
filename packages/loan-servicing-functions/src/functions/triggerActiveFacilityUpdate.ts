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
  const { data: systemDate } = await axios.get(
    'http://loan-servicing-api:3001/system/date',
  )
  const nextDay = new Date(new Date(systemDate).getTime() + 24 * 60 * 60 * 1000)
  await axios.put(
    `http://loan-servicing-api:3001/system/date/${nextDay.toISOString()}`,
  )
  const url = 'http://loan-servicing-api:3001/facility?isActive=true'

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
