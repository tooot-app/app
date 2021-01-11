import BottomSheet from '@components/BottomSheet'
import { HeaderRight } from '@components/Header'
import HeaderDefaultActionsAccount from '@components/Timelines/Timeline/Shared/HeaderDefault/ActionsAccount'
import { useAccountQuery } from '@utils/queryHooks/account'
import { getLocalAccount } from '@utils/slices/instancesSlice'
import React, { useEffect, useReducer, useState } from 'react'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated'
import { useSelector } from 'react-redux'
import AccountHeader from './Account/Header'
import AccountInformation from './Account/Information'
import AccountNav from './Account/Nav'
import AccountSegmentedControl from './Account/SegmentedControl'
import AccountToots from './Account/Toots'
import AccountContext from './Account/utils/createContext'
import accountInitialState from './Account/utils/initialState'
import accountReducer from './Account/utils/reducer'
import { SharedAccountProp } from './sharedScreens'

// Moved account example: https://m.cmx.im/web/accounts/27812

const ScreenSharedAccount: React.FC<SharedAccountProp> = ({
  route: {
    params: { account }
  },
  navigation
}) => {
  const localAccount = useSelector(getLocalAccount)
  const { data } = useAccountQuery({ id: account.id })

  const scrollY = useSharedValue(0)
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

  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y
  })

  return (
    <AccountContext.Provider value={{ accountState, accountDispatch }}>
      <AccountNav scrollY={scrollY} account={data} />
      {accountState.informationLayout?.height &&
      accountState.informationLayout.y ? (
        <AccountSegmentedControl scrollY={scrollY} />
      ) : null}
      <Animated.ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
      >
        <AccountHeader account={data} />
        <AccountInformation account={data} />
        <AccountToots id={account.id} />
      </Animated.ScrollView>

      <BottomSheet
        visible={modalVisible}
        handleDismiss={() => setBottomSheetVisible(false)}
      >
        {/* 添加到列表 */}
        {localAccount?.id !== account.id && (
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
