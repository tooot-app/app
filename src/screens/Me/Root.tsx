import { useScrollToTop } from '@react-navigation/native'
import Collections from '@screens/Me/Root/Collections'
import Login from '@screens/Me/Root/Login'
import MyInfo from '@screens/Me/Root/MyInfo'
import Settings from '@screens/Me/Root/Settings'
import Logout from '@screens/Me/Root/Logout'
import AccountNav from '@screens/Shared/Account/Nav'
import accountReducer from '@screens/Shared/Account/utils/reducer'
import accountInitialState from '@screens/Shared/Account/utils/initialState'
import AccountContext from '@screens/Shared/Account/utils/createContext'
import { getLocalUrl } from '@utils/slices/instancesSlice'
import React, { useReducer, useRef, useState } from 'react'
import { Animated, ScrollView } from 'react-native'
import { useSelector } from 'react-redux'

const ScreenMeRoot: React.FC = () => {
  const localRegistered = useSelector(getLocalUrl)

  const scrollRef = useRef<ScrollView>(null)
  useScrollToTop(scrollRef)

  const scrollY = useRef(new Animated.Value(0))
  const [data, setData] = useState<Mastodon.Account>()

  const [accountState, accountDispatch] = useReducer(
    accountReducer,
    accountInitialState
  )

  return (
    <AccountContext.Provider value={{ accountState, accountDispatch }}>
      {localRegistered && data ? (
        <AccountNav scrollY={scrollY} account={data} />
      ) : null}
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps='handled'
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY.current } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={8}
      >
        {localRegistered ? <MyInfo setData={setData} /> : <Login />}
        {localRegistered && <Collections />}
        <Settings />
        {localRegistered && <Logout />}
      </ScrollView>
    </AccountContext.Provider>
  )
}

export default ScreenMeRoot
