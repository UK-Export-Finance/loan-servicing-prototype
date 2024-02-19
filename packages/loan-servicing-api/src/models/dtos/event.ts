import { EventBase } from "loan-servicing-common"

// eslint-disable-next-line import/prefer-default-export
export class UntypedEvent implements EventBase<string, number, object> {
    streamId!: string
  
    streamVersion!: number

    datetime!: Date
  
    type!: string
  
    typeVersion!: number
  
    eventData!: object
  }