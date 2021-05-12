import AccountHeader from '@screens/Tabs/Shared/Account/Header'
import AccountInformation from '@screens/Tabs/Shared/Account/Information'
import React from 'react'

export interface Props {
  account: Mastodon.Account | undefined
}

const MyInfo: React.FC<Props> = ({ account }) => {
  return (
    <>
      <AccountHeader account={account} />
      <AccountInformation account={account} myInfo />
    </>
  )
}

export default MyInfo
