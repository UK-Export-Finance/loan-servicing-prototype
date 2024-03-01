import Big from 'big.js'
import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer'
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

class ClassTransformer<T> {
  constructor(private targetClass: ClassConstructor<T>) {}

  to(data: object): T {
    return plainToInstance(this.targetClass, data)
  }

  from(d: T): object {
    return instanceToPlain(d)
  }
}

export const ClassAsJsonColumn = <T>(
  classConstructor: ClassConstructor<T>,
): PropertyDecorator =>
  Column({
    type: 'simple-json',
    transformer: new ClassTransformer(classConstructor),
  })
