import React, { createContext, Dispatch, useReducer, useRef } from 'react'
import { Animated, ScrollView } from 'react-native'

// import * as relationshipsSlice from 'src/stacks/common/relationshipsSlice'

import { useQuery } from 'react-query'
import { accountFetch } from '@utils/fetches/accountFetch'
import AccountToots from '@screens/Shared/Account/Toots'
import AccountHeader from '@screens/Shared/Account/Header'
import AccountInformation from '@screens/Shared/Account/Information'
import AccountNav from './Account/Nav'
import AccountSegmentedControl from './Account/SegmentedControl'

// Moved account example: https://m.cmx.im/web/accounts/27812

export interface Props {
  route: {
    params: {
      id: string
    }
  }
}

export type AccountState = {
  headerRatio: number
  informationLayout?: {
    y: number
    height: number
  }
  segmentedIndex: number
}
export type AccountAction =
  | {
      type: 'headerRatio'
      payload: AccountState['headerRatio']
    }
  | {
      type: 'informationLayout'
      payload: AccountState['informationLayout']
    }
  | {
      type: 'segmentedIndex'
      payload: AccountState['segmentedIndex']
    }
const AccountInitialState: AccountState = {
  headerRatio: 0.4,
  informationLayout: { height: 0, y: 100 },
  segmentedIndex: 0
}
const accountReducer = (
  state: AccountState,
  action: AccountAction
): AccountState => {
  switch (action.type) {
    case 'headerRatio':
      return { ...state, headerRatio: action.payload }
    case 'informationLayout':
      return { ...state, informationLayout: action.payload }
    case 'segmentedIndex':
      return { ...state, segmentedIndex: action.payload }
    default:
      throw new Error('Unexpected action')
  }
}
type ContextType = {
  accountState: AccountState
  accountDispatch: Dispatch<AccountAction>
}
export const AccountContext = createContext<ContextType>({} as ContextType)

const ScreenSharedAccount: React.FC<Props> = ({
  route: {
    params: { id }
  }
}) => {
  const { data } = useQuery(['Account', { id }], accountFetch)

  // const stateRelationships = useSelector(relationshipsState)
  const scrollY = useRef(new Animated.Value(0)).current
  const [accountState, accountDispatch] = useReducer(
    accountReducer,
    AccountInitialState
  )

  return (
    <AccountContext.Provider value={{ accountState, accountDispatch }}>
      <AccountNav scrollY={scrollY} account={data} />
      <AccountSegmentedControl scrollY={scrollY} />
      <ScrollView
        contentContainerStyle={{ zIndex: 99 }}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <AccountHeader uri={data?.header} />
        <AccountInformation account={data} />
        <AccountToots id={id} />
      </ScrollView>
    </AccountContext.Provider>
  )
}

export default ScreenSharedAccount
