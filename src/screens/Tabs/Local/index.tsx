import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import usePopToTop from '@utils/navigation/usePopToTop'
import React from 'react'
import TabShared from '../Shared'
import Root from './Root'
import { HeaderLeft } from '@components/Header'

const Stack = createNativeStackNavigator<TabLocalStackParamList>()

const TabLocal: React.FC = () => {
  usePopToTop('Tab-Local-Root')

  return (
    <Stack.Navigator
      screenOptions={{ headerShadowVisible: false, headerLeft: () => <HeaderLeft /> }}
    >
      <Stack.Screen name='Tab-Local-Root' component={Root} />
      {TabShared(Stack)}
    </Stack.Navigator>
  )
}

export default TabLocal
