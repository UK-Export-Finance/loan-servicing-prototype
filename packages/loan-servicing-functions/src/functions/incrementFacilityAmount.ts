import { app, HttpResponseInit, InvocationContext } from '@azure/functions'
import axios from 'axios'
import { Facility } from 'loan-servicing-common'

async function incrementFacilityAmount(
  request: string,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Updating facility with ID "${request}"`)
  const url = `http://loan-servicing-api:3001/facility?id=${request}`

  const { data: currentFacility } = await axios.get<Facility>(url)

  const { data: newFacility } = await axios.put(url, {
    facilityAmount: currentFacility.facilityAmount + 1,
  })

  return { body: JSON.stringify(newFacility) }
}

app.storageQueue('incrementFacilityAmount', {
  queueName: 'facilityupdate',
  connection: 'StorageConnectionString',
  handler: incrementFacilityAmount,
})

export default incrementFacilityAmount
