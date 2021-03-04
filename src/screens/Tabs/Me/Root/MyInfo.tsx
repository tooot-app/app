import AccountHeader from '@screens/Tabs/Shared/Account/Header'
import AccountInformation from '@screens/Tabs/Shared/Account/Information'
import { useAccountQuery } from '@utils/queryHooks/account'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

export interface Props {
  setData: React.Dispatch<React.SetStateAction<Mastodon.Account | undefined>>
}

const MyInfo: React.FC<Props> = ({ setData }) => {
  const instanceAccount = useSelector(
    getInstanceAccount,
    (prev, next) => prev?.id === next?.id
  )
  const { data } = useAccountQuery({ id: instanceAccount!.id })

  useEffect(() => {
    if (data) {
      setData(data)
    }
  }, [data])

  return (
    <>
      <AccountHeader account={data} limitHeight />
      <AccountInformation account={data} myInfo />
    </>
  )
}

export default MyInfo
