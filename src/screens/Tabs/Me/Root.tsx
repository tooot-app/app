import ComponentInstance from '@components/Instance'
import { useScrollToTop } from '@react-navigation/native'
import Collections from '@screens/Tabs/Me/Root/Collections'
import Logout from '@screens/Tabs/Me/Root/Logout'
import MyInfo from '@screens/Tabs/Me/Root/MyInfo'
import Settings from '@screens/Tabs/Me/Root/Settings'
import AccountNav from '@screens/Tabs/Shared/Account/Nav'
import AccountContext from '@screens/Tabs/Shared/Account/utils/createContext'
import accountInitialState from '@screens/Tabs/Shared/Account/utils/initialState'
import accountReducer from '@screens/Tabs/Shared/Account/utils/reducer'
import { getLocalActiveIndex } from '@utils/slices/instancesSlice'
import React, { useReducer, useRef, useState } from 'react'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated'
import { useSelector } from 'react-redux'

const ScreenMeRoot: React.FC = () => {
  const localActiveIndex = useSelector(getLocalActiveIndex)

  const scrollRef = useRef<Animated.ScrollView>(null)
  useScrollToTop(scrollRef)

  const [data, setData] = useState<Mastodon.Account>()

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
      {localActiveIndex !== null && data ? (
        <AccountNav scrollY={scrollY} account={data} />
      ) : null}
      <Animated.ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps='handled'
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {localActiveIndex !== null ? (
          <MyInfo setData={setData} />
        ) : (
          <ComponentInstance />
        )}
        {localActiveIndex !== null ? <Collections /> : null}
        <Settings />
        {localActiveIndex !== null ? <Logout /> : null}
      </Animated.ScrollView>
    </AccountContext.Provider>
  )
}

export default ScreenMeRoot
