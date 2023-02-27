import { createContext } from 'react'

type AccountContextType = {
  account?: Mastodon.Account
  relationship?: Mastodon.Relationship
  pageMe?: boolean
  localInstance: boolean
}
const AccountContext = createContext<AccountContextType>({} as AccountContextType)

export default AccountContext
