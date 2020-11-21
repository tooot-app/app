import React from 'react'
import { View } from 'react-native'
import store from 'src/store'
import { getLocalRegistered } from 'src/utils/slices/instancesSlice'

import Login from './Root/Login'

const ScreenMeRoot: React.FC = () => {
  const localRegistered = getLocalRegistered(store.getState())

  return <View>{localRegistered ? <></> : <Login />}</View>
}

export default ScreenMeRoot
