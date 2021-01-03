import BottomSheet from '@components/BottomSheet'
import { HeaderRight } from '@components/Header'
import HeaderDefaultActionsAccount from '@components/Timelines/Timeline/Shared/HeaderDefault/ActionsAccount'
import { accountFetch } from '@utils/fetches/accountFetch'
import { getLocalAccountId } from '@utils/slices/instancesSlice'
import React, { useEffect, useReducer, useRef, useState } from 'react'
import { Animated, ScrollView } from 'react-native'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import AccountHeader from './Account/Header'
import AccountInformation from './Account/Information'
import AccountNav from './Account/Nav'
import AccountSegmentedControl from './Account/SegmentedControl'
import AccountToots from './Account/Toots'
import AccountContext from './Account/utils/createContext'
import accountInitialState from './Account/utils/initialState'
import accountReducer from './Account/utils/reducer'

// Moved account example: https://m.cmx.im/web/accounts/27812

export interface Props {
  route: {
    params: {
      account: Pick<Mastodon.Account, 'id' | 'username' | 'acct' | 'url'>
    }
  }
  navigation: any
}

const ScreenSharedAccount: React.FC<Props> = ({
  route: {
    params: { account }
  },
  navigation
}) => {
  const localAccountId = useSelector(getLocalAccountId)
  const { data } = useQuery(['Account', { id: account.id }], accountFetch)

  const scrollY = useRef(new Animated.Value(0))
  const [accountState, accountDispatch] = useReducer(
    accountReducer,
    accountInitialState
  )

  const [modalVisible, setBottomSheetVisible] = useState(false)
  useEffect(() => {
    const updateHeaderRight = () =>
      navigation.setOptions({
        headerRight: () => (
          <HeaderRight
            content='MoreHorizontal'
            onPress={() => setBottomSheetVisible(true)}
          />
        )
      })
    return updateHeaderRight()
  }, [])

  return (
    <AccountContext.Provider value={{ accountState, accountDispatch }}>
      <AccountNav scrollY={scrollY} account={data} />
      {accountState.informationLayout?.height &&
      accountState.informationLayout.y ? (
        <AccountSegmentedControl scrollY={scrollY} />
      ) : null}
      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY.current } } }],
          { useNativeDriver: false }
        )}
      >
        <AccountHeader account={data} />
        <AccountInformation account={data} />
        <AccountToots id={account.id} />
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
    </AccountContext.Provider>
  )
}

export default ScreenSharedAccount
