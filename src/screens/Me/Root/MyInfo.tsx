import React from 'react'
import { useQuery } from 'react-query'

import { accountFetch } from 'src/utils/fetches/accountFetch'
import AccountHeader from 'src/screens/Shared/Account/Header'
import AccountInformation from 'src/screens/Shared/Account/Information'

export interface Props {
  id: Mastodon.Account['id']
}

const MyInfo: React.FC<Props> = ({ id }) => {
  const { data } = useQuery(['Account', { id }], accountFetch)

  return (
    <>
      <AccountHeader uri={data?.header} limitHeight />
      <AccountInformation account={data} />
    </>
  )
}

export default MyInfo
