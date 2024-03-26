import { app, HttpResponseInit, InvocationContext } from '@azure/functions'
import axios, { AxiosError } from 'axios'

async function rebuildFacility(
  request: string,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Updating facility with ID "${request}"`)
  const rebuildFacilityUrl = `http://loan-servicing-api:3001/facility/${request}/rebuild`


  try {
    const { data: updatedFacility } = await axios.post(rebuildFacilityUrl)

    return { body: JSON.stringify(updatedFacility) }
  } catch (e) {
    const axErr = e as AxiosError
    context.error(axErr.response.data)
    throw axErr
  }
}

app.storageQueue('rebuildFacility', {
  queueName: 'facilityupdate',
  connection: 'StorageConnectionString',
  handler: rebuildFacility,
})

export default rebuildFacility