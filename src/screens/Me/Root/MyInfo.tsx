import AccountHeader from '@screens/Shared/Account/Header'
import AccountInformation from '@screens/Shared/Account/Information'
import hookAccount from '@utils/queryHooks/account'
import { getLocalAccount } from '@utils/slices/instancesSlice'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

export interface Props {
  setData: React.Dispatch<React.SetStateAction<Mastodon.Account | undefined>>
}

const MyInfo: React.FC<Props> = ({ setData }) => {
  const localAccount = useSelector(getLocalAccount)
  const { data } = hookAccount({ id: localAccount!.id })

  useEffect(() => {
    if (data) {
      setData(data)
    }
  }, [data])

  return (
    <>
      <AccountHeader account={data} limitHeight />
      <AccountInformation account={data} ownAccount />
    </>
  )
}

export default MyInfo
