export type FacilityTransaction = {
  streamId: string
  datetime: Date
  reference: string
  principalChange: string
  interestChange: string
  balanceAfterTransaction: string
  interestAccrued: string
}

export type TransactionResolution = 'daily' | 'monthly'
