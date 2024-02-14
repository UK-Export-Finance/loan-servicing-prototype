import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import axios from 'axios'
import { Facility } from 'loan-servicing-common'

async function incrementFacilityAmount(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`)
  const url =
    'http://localhost:3001/facility?id=d842526c-5af9-44bb-98af-fd43bee12446'

  const { data: currentFacility } = await axios.get<Facility>(url)

  const { data: newFacility } = await axios.put(url, {
    facilityAmount: currentFacility.facilityAmount + 1,
  })

  return { body: JSON.stringify(newFacility) }
}

app.http('incrementFacilityAmount', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: incrementFacilityAmount,
})

export default incrementFacilityAmount
