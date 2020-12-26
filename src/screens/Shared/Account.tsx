import React, { useEffect, useReducer, useRef, useState } from 'react'
import { Animated, ScrollView } from 'react-native'

import { useQuery } from 'react-query'
import { accountFetch } from '@utils/fetches/accountFetch'
import AccountToots from '@screens/Shared/Account/Toots'
import AccountHeader from '@screens/Shared/Account/Header'
import AccountInformation from '@screens/Shared/Account/Information'
import AccountNav from './Account/Nav'
import AccountSegmentedControl from './Account/SegmentedControl'
import { HeaderRight } from '@root/components/Header'
import BottomSheet from '@root/components/BottomSheet'
import { useSelector } from 'react-redux'
import { getLocalAccountId } from '@root/utils/slices/instancesSlice'
import HeaderDefaultActionsAccount from '@root/components/Timelines/Timeline/Shared/HeaderDefault/ActionsAccount'
import layoutAnimation from '@root/utils/styles/layoutAnimation'

// Moved account example: https://m.cmx.im/web/accounts/27812

export interface Props {
  route: {
    params: {
      account: Mastodon.Account
    }
  }
  navigation: any
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

const ScreenSharedAccount: React.FC<Props> = ({
  route: {
    params: { account }
  },
  navigation
}) => {
  layoutAnimation()
  const localAccountId = useSelector(getLocalAccountId)
  const { data } = useQuery(['Account', { id: account.id }], accountFetch)

  const scrollY = useRef(new Animated.Value(0)).current
  const [accountState, accountDispatch] = useReducer(
    accountReducer,
    AccountInitialState
  )

  const [modalVisible, setBottomSheetVisible] = useState(false)
  useEffect(() => {
    const updateHeaderRight = () =>
      navigation.setOptions({
        headerRight: () => (
          <HeaderRight
            content='more-horizontal'
            onPress={() => setBottomSheetVisible(true)}
          />
        )
      })
    return updateHeaderRight()
  }, [])

  return (
    <>
      <AccountNav
        accountState={accountState}
        scrollY={scrollY}
        account={data}
      />
      {accountState.informationLayout?.height &&
      accountState.informationLayout.y ? (
        <AccountSegmentedControl
          accountState={accountState}
          accountDispatch={accountDispatch}
          scrollY={scrollY}
        />
      ) : null}
      <ScrollView
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={8}
      >
        <AccountHeader
          accountState={accountState}
          accountDispatch={accountDispatch}
          account={data}
        />
        <AccountInformation accountDispatch={accountDispatch} account={data} />
        <AccountToots
          accountState={accountState}
          accountDispatch={accountDispatch}
          id={account.id}
        />
      </ScrollView>

      <BottomSheet
        visible={modalVisible}
        handleDismiss={() => setBottomSheetVisible(false)}
      >
        {/* 添加到列表 */}
        {localAccountId !== account.id && (
          <HeaderDefaultActionsAccount
            account={account}
            setBottomSheetVisible={setBottomSheetVisible}
          />
        )}
      </BottomSheet>
    </>
  )
}

export default ScreenSharedAccount
