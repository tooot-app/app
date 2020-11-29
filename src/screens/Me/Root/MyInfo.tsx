import React from 'react'
import { useQuery } from 'react-query'

import { accountFetch } from 'src/utils/fetches/accountFetch'
import AccountHeader from 'src/screens/Shared/Account/Header'
import AccountInformation from 'src/screens/Shared/Account/Information'
import { useSelector } from 'react-redux'
import { getLocalAccountId } from 'src/utils/slices/instancesSlice'

const MyInfo: React.FC = () => {
  const localAccountId = useSelector(getLocalAccountId)
  const { data } = useQuery(['Account', { id: localAccountId }], accountFetch)

  return (
    <>
      <AccountHeader uri={data?.header} limitHeight />
      <AccountInformation account={data} />
    </>
  )
}

export default MyInfo
