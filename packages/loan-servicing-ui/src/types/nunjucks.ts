export type NunjuckTableRow = { text: string }[]

export type NunjuckSelectInputOption<T extends string> = {
  text: string
  value: T
}

export type GovUkSummaryListRow = {
  key: {
    text: string
  }
  value: {
    text?: string
    html?: string
  }
  actions?: {
    items: {
      href: string
      text: string
      visuallyHiddenText?: string
    }[]
  }
}

export type GovUkSummaryListProps = {
  rows: GovUkSummaryListRow[]
}
