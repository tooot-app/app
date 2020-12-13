import React from 'react'
import { ScrollView } from 'react-native'
import { useSelector } from 'react-redux'

import { getLocalUrl } from '@utils/slices/instancesSlice'

import Login from '@screens/Me/Root/Login'
import MyInfo from '@screens/Me/Root/MyInfo'
import Collections from '@screens/Me/Root/Collections'
import Settings from '@screens/Me/Root/Settings'
import Logout from '@screens/Me/Root/Logout'

const ScreenMeRoot: React.FC = () => {
  const localRegistered = useSelector(getLocalUrl)

  return (
    <ScrollView keyboardShouldPersistTaps='handled'>
      {localRegistered ? <MyInfo /> : <Login />}
      {localRegistered && <Collections />}
      <Settings />
      {localRegistered && <Logout />}
    </ScrollView>
  )
}

export default ScreenMeRoot
