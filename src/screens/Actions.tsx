import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import ScreenActionsRoot from './Actions/Root'

export type ScreenAccountProp = StackScreenProps<
  Nav.RootStackParamList,
  'Screen-Actions'
>

const ScreenActions = React.memo(
  (props: ScreenAccountProp) => {
    return (
      <SafeAreaProvider>
        <ScreenActionsRoot {...props} />
      </SafeAreaProvider>
    )
  },
  () => true
)

export default ScreenActions
