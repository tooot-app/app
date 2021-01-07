import { useScrollToTop } from '@react-navigation/native'
import Collections from '@screens/Me/Root/Collections'
import MyInfo from '@screens/Me/Root/MyInfo'
import Settings from '@screens/Me/Root/Settings'
import Logout from '@screens/Me/Root/Logout'
import AccountNav from '@screens/Shared/Account/Nav'
import accountReducer from '@screens/Shared/Account/utils/reducer'
import accountInitialState from '@screens/Shared/Account/utils/initialState'
import AccountContext from '@screens/Shared/Account/utils/createContext'
import { getLocalActiveIndex } from '@utils/slices/instancesSlice'
import React, { useReducer, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated'
import ComponentInstance from '@components/Instance'

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
          <ComponentInstance type='local' />
        )}
        {localActiveIndex !== null ? <Collections /> : null}
        <Settings />
        {localActiveIndex !== null ? <Logout /> : null}
      </Animated.ScrollView>
    </AccountContext.Provider>
  )
}

export default ScreenMeRoot
