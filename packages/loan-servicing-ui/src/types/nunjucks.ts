export type NunjuckTableRow = { text?: string; html?: string }[]

export type NunjuckSelectInputOption<T extends string> = {
  text: string
  value: T
}

export type GovUkAction = {
  href: string
  text: string
  visuallyHiddenText?: string
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
    items: GovUkAction[]
  }
}

export type GovUkSummaryListProps = {
  card?: {
    title: {
      text: string
    }
    actions?: { items: GovUkAction[] }
  }
  rows: GovUkSummaryListRow[]
}
