import React, { useRef, useState } from 'react'
import { Animated, ScrollView } from 'react-native'
import { useSelector } from 'react-redux'

import { getLocalUrl } from '@utils/slices/instancesSlice'

import Login from '@screens/Me/Root/Login'
import MyInfo from '@screens/Me/Root/MyInfo'
import Collections from '@screens/Me/Root/Collections'
import Settings from '@screens/Me/Root/Settings'
import Logout from '@screens/Me/Root/Logout'
import { useScrollToTop } from '@react-navigation/native'
import { AccountState } from '../Shared/Account'
import AccountNav from '../Shared/Account/Nav'
import layoutAnimation from '@root/utils/styles/layoutAnimation'

const ScreenMeRoot: React.FC = () => {
  const localRegistered = useSelector(getLocalUrl)

  const scrollRef = useRef<ScrollView>(null)
  useScrollToTop(scrollRef)

  const scrollY = useRef(new Animated.Value(0)).current
  const [data, setData] = useState<Mastodon.Account>()

  return (
    <>
      {localRegistered && data ? (
        <AccountNav
          accountState={{ headerRatio: 0.4 } as AccountState}
          scrollY={scrollY}
          account={data}
        />
      ) : null}
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps='handled'
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={8}
      >
        {localRegistered ? <MyInfo setData={setData} /> : <Login />}
        {localRegistered && <Collections />}
        <Settings />
        {localRegistered && <Logout />}
      </ScrollView>
    </>
  )
}

export default ScreenMeRoot
