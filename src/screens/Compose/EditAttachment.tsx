import { HeaderCenter, HeaderLeft } from '@components/Header'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import ComposeEditAttachmentRoot from './EditAttachment/Root'
import ComposeEditAttachmentSubmit from './EditAttachment/Submit'

const Stack = createNativeStackNavigator()

export type ScreenComposeEditAttachmentProp = StackScreenProps<
  Nav.ScreenComposeStackParamList,
  'Screen-Compose-EditAttachment'
>

const ComposeEditAttachment: React.FC<ScreenComposeEditAttachmentProp> = ({
  route: {
    params: { index }
  },
  navigation
}) => {
  console.log('rendering')
  const { t } = useTranslation('screenCompose')

  const headerLeft = useCallback(
    () => (
      <HeaderLeft
        type='icon'
        content='ChevronDown'
        onPress={() => navigation.goBack()}
      />
    ),
    []
  )

  const children = useCallback(
    () => <ComposeEditAttachmentRoot index={index} />,
    []
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
        <Stack.Navigator screenOptions={{ headerTopInsetEnabled: false }}>
          <Stack.Screen
            name='Screen-Compose-EditAttachment-Root'
            children={children}
            options={{
              headerLeft,
              headerRight: () => <ComposeEditAttachmentSubmit index={index} />,
              headerTitle: t('content.editAttachment.header.title'),
              ...(Platform.OS === 'android' && {
                headerCenter: () => (
                  <HeaderCenter
                    content={t('content.editAttachment.header.title')}
                  />
                )
              })
            }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

export default ComposeEditAttachment
