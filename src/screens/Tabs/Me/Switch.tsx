import { HeaderCenter, HeaderLeft } from '@components/Header'
import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import ScreenMeSwitchRoot from './Switch/Root'

const Stack = createNativeStackNavigator()

const ScreenMeSwitch: React.FC<StackScreenProps<
  Nav.TabMeStackParamList,
  'Tab-Me-Switch'
>> = ({ navigation }) => {
  const { t } = useTranslation()
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Navigator
        screenOptions={{ headerHideShadow: true, headerTopInsetEnabled: false }}
      >
        <Stack.Screen
          name='Screen-Me-Switch-Root'
          component={ScreenMeSwitchRoot}
          options={{
            headerTitle: t('meSwitch:heading'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('meSwitch:heading')} />
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
    </KeyboardAvoidingView>
  )
}

export default ScreenMeSwitch
