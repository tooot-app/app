import ComponentInstance from '@components/Instance'
import { useScrollToTop } from '@react-navigation/native'
import Collections from '@screens/Tabs/Me/Root/Collections'
import Logout from '@screens/Tabs/Me/Root/Logout'
import MyInfo from '@screens/Tabs/Me/Root/MyInfo'
import Settings from '@screens/Tabs/Me/Root/Settings'
import AccountInformationSwitch from '@screens/Tabs/Me/Root/Switch'
import AccountContext from '@screens/Tabs/Shared/Account/Context'
import AccountNav from '@screens/Tabs/Shared/Account/Nav'
import { useProfileQuery } from '@utils/queryHooks/profile'
import { useGlobalStorage } from '@utils/storage/actions'
import React, { useRef } from 'react'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'

const TabMeRoot: React.FC = () => {
  const [accountActive] = useGlobalStorage.string('account.active')

  const { data } = useProfileQuery({
    options: { enabled: !!accountActive, keepPreviousData: false }
  })

  const scrollRef = useRef<Animated.ScrollView>(null)
  useScrollToTop(scrollRef)

  const scrollY = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y
  })

  return (
    <AccountContext.Provider value={{ account: data, pageMe: true }}>
      {accountActive && data ? <AccountNav scrollY={scrollY} /> : null}
      <Animated.ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps='handled'
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {accountActive ? <MyInfo /> : <ComponentInstance />}
        {accountActive ? <Collections /> : null}
        <Settings />
        {accountActive ? <AccountInformationSwitch /> : null}
        {accountActive ? <Logout /> : null}
      </Animated.ScrollView>
    </AccountContext.Provider>
  )
}

export default TabMeRoot
