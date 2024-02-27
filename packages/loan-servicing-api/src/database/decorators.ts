import Big from 'big.js'
import { Column } from 'typeorm'

class DecimalStringTransformer {
  to(data: string): string {
    return data
  }

  from(data: number): string {
    return Big(data).toString()
  }
}

// eslint-disable-next-line import/prefer-default-export
export const CurrencyColumn = (): PropertyDecorator =>
  Column({
    type: 'decimal',
    scale: 2,
    precision: 12,
    transformer: new DecimalStringTransformer(),
  })
