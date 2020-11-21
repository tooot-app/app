import React from 'react'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import { RootState } from 'src/store'

import Login from './Root/Login'

const ScreenMeRoot: React.FC = () => {
  const localRegistered = useSelector(
    (state: RootState) => state.instances.local.url
  )

  return <View>{localRegistered ? <></> : <Login />}</View>
}

export default ScreenMeRoot
