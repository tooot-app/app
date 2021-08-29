import { HeaderLeft } from '@components/Header'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ScreenComposeStackScreenProps } from '@utils/navigation/navigators'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ComposeEditAttachmentRoot from './EditAttachment/Root'
import ComposeEditAttachmentSubmit from './EditAttachment/Submit'

const Stack = createNativeStackNavigator()

const ComposeEditAttachment: React.FC<ScreenComposeStackScreenProps<
  'Screen-Compose-EditAttachment'
>> = ({
  route: {
    params: { index }
  },
  navigation
}) => {
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
        <Stack.Navigator>
          <Stack.Screen
            name='Screen-Compose-EditAttachment-Root'
            children={children}
            options={{
              headerLeft,
              headerRight: () => <ComposeEditAttachmentSubmit index={index} />,
              headerTitle: t('content.editAttachment.header.title')
            }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

export default ComposeEditAttachment
