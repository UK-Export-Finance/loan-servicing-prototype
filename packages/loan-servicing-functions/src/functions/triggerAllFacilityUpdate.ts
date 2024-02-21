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

async function triggerAllFacilityUpdate(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`)
  const url = 'http://loan-servicing-api:3001/facility/all'

  const { data: allFacilities } = await axios.get<Facility[]>(url)

  const messages = allFacilities?.map((i) => i.streamId)

  context.extraOutputs.set(queueOutput, messages)

  return { body: 'Successfully queued all updates' }
}

app.http('triggerAllFacilityUpdate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  extraOutputs: [queueOutput],
  handler: triggerAllFacilityUpdate,
})

export default triggerAllFacilityUpdate
