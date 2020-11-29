import React from 'react'
import { ScrollView } from 'react-native'
import { useSelector } from 'react-redux'

import { getLocalUrl } from 'src/utils/slices/instancesSlice'

import Login from './Root/Login'
import MyInfo from './Root/MyInfo'
import MyCollections from './Root/MyCollections'
import Settings from './Root/Settings'
import Logout from './Root/Logout'

const ScreenMeRoot: React.FC = () => {
  const localRegistered = useSelector(getLocalUrl)

  return (
    <ScrollView>
      {localRegistered ? <MyInfo /> : <Login />}
      {localRegistered && <MyCollections />}
      <Settings />
      {localRegistered && <Logout />}
    </ScrollView>
  )
}

export default ScreenMeRoot
