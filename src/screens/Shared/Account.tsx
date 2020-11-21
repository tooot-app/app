import React from 'react'
import { ScrollView } from 'react-native'

// import * as relationshipsSlice from 'src/stacks/common/relationshipsSlice'

import { useQuery } from 'react-query'
import { accountFetch } from '../../utils/fetches/accountFetch'
import AccountToots from './Account/Toots'
import AccountHeader from './Account/Header'
import AccountInformation from './Account/Information'

// Moved account example: https://m.cmx.im/web/accounts/27812

export interface Props {
  route: {
    params: {
      id: string
    }
  }
}

const ScreenSharedAccount: React.FC<Props> = ({
  route: {
    params: { id }
  }
}) => {
  const { data } = useQuery(['Account', { id }], accountFetch)

  // const stateRelationships = useSelector(relationshipsState)

  return (
    <ScrollView bounces={false}>
      <AccountHeader uri={data?.header} />
      <AccountInformation account={data} />
      <AccountToots id={id} />
    </ScrollView>
  )
}

export default ScreenSharedAccount
