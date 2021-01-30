import { createContext, Dispatch } from 'react'
import { AccountAction, AccountState } from './types'

type ContextType = {
  accountState: AccountState
  accountDispatch: Dispatch<AccountAction>
}
const AccountContext = createContext<ContextType>({} as ContextType)

export default AccountContext
