import { HeaderCenter, HeaderLeft } from '@components/Header'
import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import ScreenMeSwitchRoot from './Switch/Root'

const Stack = createNativeStackNavigator()

const ScreenMeSwitch: React.FC<StackScreenProps<
  Nav.MeStackParamList,
  'Screen-Me-Switch'
>> = ({ navigation }) => {
  const { t } = useTranslation()
  return (
    <Stack.Navigator
      screenOptions={{ headerHideShadow: true, headerTopInsetEnabled: false }}
    >
      <Stack.Screen
        name='Screen-Me-Switch-Root'
        component={ScreenMeSwitchRoot}
        options={{
          headerTitle: t('meSwitch:heading'),
          ...(Platform.OS === 'android' && {
            headerCenter: () => <HeaderCenter content={t('meSwitch:heading')} />
          }),
          headerLeft: () => (
            <HeaderLeft content='X' onPress={() => navigation.goBack()} />
          )
        }}
      />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})

export default ScreenMeSwitch
