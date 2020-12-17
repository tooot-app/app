import React, { useEffect } from 'react'
import { useQuery } from 'react-query'

import { accountFetch } from '@utils/fetches/accountFetch'
import AccountHeader from '@screens/Shared/Account/Header'
import AccountInformation from '@screens/Shared/Account/Information'
import { useSelector } from 'react-redux'
import { getLocalAccountId } from '@utils/slices/instancesSlice'
import { AccountState } from '@root/screens/Shared/Account'

export interface Props {
  setData: React.Dispatch<React.SetStateAction<Mastodon.Account | undefined>>
}

const MyInfo: React.FC<Props> = ({ setData }) => {
  const localAccountId = useSelector(getLocalAccountId)
  const { data } = useQuery(['Account', { id: localAccountId }], accountFetch)
  useEffect(() => {
    if (data) {
      setData(data)
    }
  }, [data])

  return (
    <>
      <AccountHeader
        accountState={{ headerRatio: 0.4 } as AccountState}
        account={data}
        limitHeight
      />
      <AccountInformation account={data} />
    </>
  )
}

export default MyInfo
