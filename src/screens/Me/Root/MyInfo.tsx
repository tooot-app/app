import AccountHeader from '@screens/Shared/Account/Header'
import AccountInformation from '@screens/Shared/Account/Information'
import { accountFetch } from '@utils/fetches/accountFetch'
import { getLocalAccountId } from '@utils/slices/instancesSlice'
import React, { useEffect } from 'react'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'

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
      <AccountHeader account={data} limitHeight />
      <AccountInformation account={data} disableActions />
    </>
  )
}

export default MyInfo
