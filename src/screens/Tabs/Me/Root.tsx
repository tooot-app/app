import ComponentInstance from '@components/Instance'
import { useScrollToTop } from '@react-navigation/native'
import Collections from '@screens/Tabs/Me/Root/Collections'
import Logout from '@screens/Tabs/Me/Root/Logout'
import MyInfo from '@screens/Tabs/Me/Root/MyInfo'
import Settings from '@screens/Tabs/Me/Root/Settings'
import AccountInformationSwitch from '@screens/Tabs/Me/Root/Switch'
import AccountNav from '@screens/Tabs/Shared/Account/Nav'
import AccountContext from '@screens/Tabs/Shared/Account/utils/createContext'
import accountInitialState from '@screens/Tabs/Shared/Account/utils/initialState'
import accountReducer from '@screens/Tabs/Shared/Account/utils/reducer'
import { useProfileQuery } from '@utils/queryHooks/profile'
import { getInstanceActive } from '@utils/slices/instancesSlice'
import React, { useReducer, useRef } from 'react'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated'
import { useSelector } from 'react-redux'
import Update from './Root/Update'

const TabMeRoot: React.FC = () => {
  const instanceActive = useSelector(getInstanceActive)

  const { data } = useProfileQuery({
    options: { enabled: instanceActive !== -1, keepPreviousData: false }
  })

  const scrollRef = useRef<Animated.ScrollView>(null)
  useScrollToTop(scrollRef)

  const [accountState, accountDispatch] = useReducer(
    accountReducer,
    accountInitialState
  )

  const scrollY = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y
  })

  return (
    <AccountContext.Provider value={{ accountState, accountDispatch }}>
      {instanceActive !== -1 && data ? (
        <AccountNav scrollY={scrollY} account={data} />
      ) : null}
      <Animated.ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps='handled'
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {instanceActive !== -1 ? (
          <MyInfo account={data} />
        ) : (
          <ComponentInstance />
        )}
        {instanceActive !== -1 ? <Collections /> : null}
        <Update />
        <Settings />
        {instanceActive !== -1 ? <AccountInformationSwitch /> : null}
        {instanceActive !== -1 ? <Logout /> : null}
      </Animated.ScrollView>
    </AccountContext.Provider>
  )
}

export default TabMeRoot
