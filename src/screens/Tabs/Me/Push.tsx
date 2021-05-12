import { HeaderCenter, HeaderLeft } from '@components/Header'
import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import TabMePushRoot from './Push/Root'

const Stack = createNativeStackNavigator<Nav.TabMePushStackParamList>()

const TabMePush: React.FC<StackScreenProps<
  Nav.TabMeStackParamList,
  'Tab-Me-Push'
>> = ({ navigation }) => {
  const { t } = useTranslation('screenTabs')

  return (
    <Stack.Navigator
      screenOptions={{ headerHideShadow: true, headerTopInsetEnabled: false }}
    >
      <Stack.Screen
        name='Tab-Me-Push-Root'
        component={TabMePushRoot}
        options={{
          headerTitle: t('me.stacks.push.name'),
          ...(Platform.OS === 'android' && {
            headerCenter: () => (
              <HeaderCenter content={t('me.stacks.push.name')} />
            )
          }),
          headerLeft: () => (
            <HeaderLeft
              content='ChevronDown'
              onPress={() => navigation.goBack()}
            />
          )
        }}
      />
    </Stack.Navigator>
  )
}

export default TabMePush
