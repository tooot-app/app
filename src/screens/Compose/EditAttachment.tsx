import client from '@api/client'
import analytics from '@components/analytics'
import haptics from '@components/haptics'
import { HeaderCenter, HeaderLeft, HeaderRight } from '@components/Header'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import ComposeEditAttachmentRoot from './EditAttachment/Root'
import ComposeContext from './utils/createContext'

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
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation('sharedCompose')
  const theAttachment = composeState.attachments.uploads[index].remote!

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [altText, setAltText] = useState<string | undefined>(
    theAttachment.description
  )
  const focus = useSharedValue({
    x: theAttachment.meta.focus.x,
    y: theAttachment.meta.focus.y
  })

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      composeDispatch({
        type: 'attachment/edit',
        payload: {
          ...theAttachment,
          description: altText,
          meta: {
            ...theAttachment.meta,
            focus: {
              x: focus.value.x > 1 ? 1 : focus.value.x,
              y: focus.value.y > 1 ? 1 : focus.value.y
            }
          }
        }
      })
    })

    return unsubscribe
  }, [focus.value.x, focus.value.y, altText])

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
  const headerRight = useCallback(
    () => (
      <HeaderRight
        type='icon'
        content='Save'
        loading={isSubmitting}
        onPress={() => {
          analytics('editattachment_confirm_press')
          if (!altText && focus.value.x === 0 && focus.value.y === 0) {
            navigation.goBack()
            return
          }
          setIsSubmitting(true)
          const formData = new FormData()
          if (altText) {
            formData.append('description', altText)
          }
          if (focus.value.x !== 0 || focus.value.y !== 0) {
            formData.append('focus', `${focus.value.x},${focus.value.y}`)
          }

          client<Mastodon.Attachment>({
            method: 'put',
            instance: 'local',
            url: `media/${theAttachment.id}`,
            body: formData
          })
            .then(() => {
              haptics('Success')
              navigation.goBack()
            })
            .catch(() => {
              setIsSubmitting(false)
              haptics('Error')
              Alert.alert(
                t('content.editAttachment.header.right.failed.title'),
                undefined,
                [
                  {
                    text: t(
                      'content.editAttachment.header.right.failed.button'
                    ),
                    style: 'cancel'
                  }
                ]
              )
            })
        }}
      />
    ),

    [isSubmitting, altText, focus.value.x, focus.value.y]
  )

  const children = useCallback(
    () => (
      <ComposeEditAttachmentRoot
        index={index}
        focus={focus}
        altText={altText}
        setAltText={setAltText}
      />
    ),
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
              headerRight,
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
