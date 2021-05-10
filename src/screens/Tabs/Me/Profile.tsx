import { HeaderCenter, HeaderLeft } from '@components/Header'
import { Message } from '@components/Message'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform } from 'react-native'
import FlashMessage from 'react-native-flash-message'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import ScreenMeProfileFields from './Profile/Fields'
import ScreenMeProfileName from './Profile/Name'
import ScreenMeProfileNote from './Profile/Note'
import ScreenMeProfileRoot from './Profile/Root'

const Stack = createNativeStackNavigator<Nav.TabMeProfileStackParamList>()

const TabMeProfile: React.FC<StackScreenProps<
  Nav.TabMeStackParamList,
  'Tab-Me-Switch'
>> = ({ navigation }) => {
  const { t } = useTranslation('screenTabs')
  const messageRef = useRef<FlashMessage>(null)

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Navigator
        screenOptions={{ headerHideShadow: true, headerTopInsetEnabled: false }}
      >
        <Stack.Screen
          name='Tab-Me-Profile-Root'
          component={ScreenMeProfileRoot}
          options={{
            headerTitle: t('me.stacks.profile.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.profile.name')} />
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
        <Stack.Screen
          name='Tab-Me-Profile-Name'
          options={{
            headerTitle: t('me.stacks.profileName.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.profileName.name')} />
              )
            })
          }}
        >
          {({ route, navigation }) => (
            <ScreenMeProfileName
              messageRef={messageRef}
              route={route}
              navigation={navigation}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name='Tab-Me-Profile-Note'
          options={{
            headerTitle: t('me.stacks.profileNote.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.profileNote.name')} />
              )
            })
          }}
        >
          {({ route, navigation }) => (
            <ScreenMeProfileNote
              messageRef={messageRef}
              route={route}
              navigation={navigation}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name='Tab-Me-Profile-Fields'
          options={{
            headerTitle: t('me.stacks.profileFields.name'),
            ...(Platform.OS === 'android' && {
              headerCenter: () => (
                <HeaderCenter content={t('me.stacks.profileFields.name')} />
              )
            })
          }}
        >
          {({ route, navigation }) => (
            <ScreenMeProfileFields
              messageRef={messageRef}
              route={route}
              navigation={navigation}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>

      <Message ref={messageRef} />
    </KeyboardAvoidingView>
  )
}

export default TabMeProfile
