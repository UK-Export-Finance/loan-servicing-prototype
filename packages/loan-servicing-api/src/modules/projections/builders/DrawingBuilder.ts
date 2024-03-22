import {
  DeepReadonly,
  Drawing,
  DrawingAccrual,
  Repayment,
  NonNestedValues,
} from 'loan-servicing-common'
import { deepCopy } from './builerUtils'

export type InProgressDrawing = DeepReadonly<
  Omit<Drawing, 'facility' | 'accruals' | 'repayments'>
>
export class DrawingBuilder {
  private accruals: DrawingAccrual[] = []

  private repayments: Repayment[] = []

  constructor(
    private readonly _drawing: Omit<
      Drawing,
      'facility' | 'accruals' | 'repayments'
    >,
  ) {}

  public readonly id = this._drawing.streamId

  public readonly drawing: InProgressDrawing = this._drawing

  build = (): Omit<Drawing, 'facility'> =>
    deepCopy({
      ...this._drawing,
      accruals: this.accruals,
      repayments: this.repayments,
    })

  getAccrual = (id: string): Readonly<DrawingAccrual> => {
    const accrual = this.accruals.find((a) => a.id === id)!
    return accrual
  }

  addAccruals(newAccruals: DrawingAccrual[] | DrawingAccrual): this {
    if (Array.isArray(newAccruals)) {
      this.accruals.push(...newAccruals)
    } else {
      this.accruals.push(newAccruals)
    }
    return this
  }

  setRepayments(repayments: Repayment[]): this {
    this.repayments = repayments
    return this
  }

  getRepayment = (id: string): DeepReadonly<Repayment> =>
    this.getMutableRepayment(id)

  private getMutableRepayment(id: string): Repayment {
    const repayment = this.repayments.find((r) => r.id === id)
    if (!repayment) {
      throw new Error(`repayment with id ${id} was not found`)
    }
    return repayment
  }

  updateRepaymentValue(
    id: string,
    update: Partial<NonNestedValues<Repayment>>,
  ): this {
    const repayment = this.getMutableRepayment(id)
    Object.assign(repayment, update)
    return this
  }

  updateAccrualValue = (id: string, value: string): this => {
    const accrual = this.accruals.find((a) => a.id === id)!
    accrual.currentValue = value
    return this
  }

  updateDrawingValues = (updates: Partial<NonNestedValues<Drawing>>): this => {
    Object.assign(this._drawing, updates)
    return this
  }
}
