export type AccountState = {
  headerRatio: number
  informationLayout?: {
    y: number
    height: number
  }
  segmentedIndex: number
}

export type AccountAction =
  | {
      type: 'headerRatio'
      payload: AccountState['headerRatio']
    }
  | {
      type: 'informationLayout'
      payload: AccountState['informationLayout']
    }
  | {
      type: 'segmentedIndex'
      payload: AccountState['segmentedIndex']
    }
