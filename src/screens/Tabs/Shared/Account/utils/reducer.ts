import { AccountAction, AccountState } from "./types"

const accountReducer = (
  state: AccountState,
  action: AccountAction
): AccountState => {
  switch (action.type) {
    case 'headerRatio':
      return { ...state, headerRatio: action.payload }
    case 'informationLayout':
      return { ...state, informationLayout: action.payload }
    case 'segmentedIndex':
      return { ...state, segmentedIndex: action.payload }
    default:
      throw new Error('Unexpected action')
  }
}

export default accountReducer