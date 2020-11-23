import React from 'react'
import { ScrollView } from 'react-native'
import { useSelector } from 'react-redux'

import { RootState, store } from 'src/store'
import { getLocalAccountId } from 'src/utils/slices/instancesSlice'

import Login from './Root/Login'
import MyInfo from './Root/MyInfo'
import MyCollections from './Root/MyCollections'
import Settings from './Root/Settings'
import Logout from './Root/Logout'

const ScreenMeRoot: React.FC = () => {
  const localRegistered = useSelector(
    (state: RootState) => state.instances.local.url
  )

  return (
    <ScrollView>
      {localRegistered ? (
        <MyInfo id={getLocalAccountId(store.getState())!} />
      ) : (
        <Login />
      )}
      {localRegistered && (
        <MyCollections id={getLocalAccountId(store.getState())!} />
      )}
      <Settings />
      {localRegistered && <Logout />}
    </ScrollView>
  )
}

export default ScreenMeRoot
