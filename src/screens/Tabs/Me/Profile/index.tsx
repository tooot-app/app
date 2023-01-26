import { HeaderLeft } from '@components/Header'
import { Message } from '@components/Message'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabMeProfileStackParamList, TabMeStackScreenProps } from '@utils/navigation/navigators'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform } from 'react-native'
import FlashMessage from 'react-native-flash-message'
import TabMeProfileFields from './Fields'
import TabMeProfileName from './Name'
import TabMeProfileNote from './Note'
import TabMeProfileRoot from './Root'

const Stack = createNativeStackNavigator<TabMeProfileStackParamList>()

const TabMeProfile: React.FC<TabMeStackScreenProps<'Tab-Me-Switch'>> = ({ navigation }) => {
  const { t } = useTranslation('screenTabs')
  const messageRef = useRef<FlashMessage>(null)

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen
          name='Tab-Me-Profile-Root'
          options={{
            title: t('me.stacks.profile.name'),
            headerLeft: () => (
              <HeaderLeft content='chevron-down' onPress={() => navigation.goBack()} />
            )
          }}
        >
          {props => <TabMeProfileRoot messageRef={messageRef} {...props} />}
        </Stack.Screen>
        <Stack.Screen
          name='Tab-Me-Profile-Name'
          options={{ title: t('me.stacks.profileName.name') }}
        >
          {props => <TabMeProfileName messageRef={messageRef} {...props} />}
        </Stack.Screen>
        <Stack.Screen
          name='Tab-Me-Profile-Note'
          options={{ title: t('me.stacks.profileNote.name') }}
        >
          {props => <TabMeProfileNote messageRef={messageRef} {...props} />}
        </Stack.Screen>
        <Stack.Screen
          name='Tab-Me-Profile-Fields'
          options={{ title: t('me.stacks.profileFields.name') }}
        >
          {props => <TabMeProfileFields messageRef={messageRef} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>

      <Message ref={messageRef} />
    </KeyboardAvoidingView>
  )
}

export default TabMeProfile
