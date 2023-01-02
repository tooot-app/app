import { createContext } from 'react'

type AccountContextType = {
  account?: Mastodon.Account
  pageMe?: boolean
}
const AccountContext = createContext<AccountContextType>({} as AccountContextType)

export default AccountContext
