import client from '@api/client'
import analytics from '@components/analytics'
import haptics from '@components/haptics'
import { HeaderLeft, HeaderRight } from '@components/Header'
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import ComposeEditAttachmentRoot from './EditAttachment/Root'
import ComposeContext from './utils/createContext'

const Stack = createNativeStackNavigator()

export interface Props {
  route: {
    params: {
      index: number
    }
  }
  navigation: any
}

const ComposeEditAttachment: React.FC<Props> = ({
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
  const focus = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      let needUpdate = false

      if (theAttachment.description !== altText) {
        theAttachment.description = altText
        needUpdate = true
      }

      if (theAttachment.type === 'image') {
        if (focus.current.x !== 0 || focus.current.y !== 0) {
          theAttachment.meta &&
            (theAttachment.meta.focus = {
              x: focus.current.x > 1 ? 1 : focus.current.x,
              y: focus.current.y > 1 ? 1 : focus.current.y
            })
          needUpdate = true
        }
      }
      if (needUpdate) {
        composeDispatch({ type: 'attachment/edit', payload: theAttachment })
      }
    })

    return unsubscribe
  }, [focus, altText])

  const headerLeft = useCallback(
    () => (
      <HeaderLeft
        type='text'
        content={t('content.editAttachment.header.left')}
        onPress={() => navigation.goBack()}
      />
    ),
    []
  )
  const headerRight = useCallback(
    () => (
      <HeaderRight
        type='text'
        content={t('content.editAttachment.header.right.button')}
        loading={isSubmitting}
        onPress={() => {
          analytics('editattachment_confirm_press')
          if (!altText && focus.current.x === 0 && focus.current.y === 0) {
            navigation.goBack()
            return
          }
          setIsSubmitting(true)
          const formData = new FormData()
          if (altText) {
            formData.append('description', altText)
          }
          if (focus.current.x !== 0 || focus.current.y !== 0) {
            formData.append('focus', `${focus.current.x},${focus.current.y}`)
          }

          client<Mastodon.Attachment>({
            method: 'put',
            instance: 'local',
            url: `media/${theAttachment.id}`,
            body: formData
          })
            .then(() => {
              haptics('Success')
              Alert.alert(
                t('content.editAttachment.header.right.succeed.title'),
                undefined,
                [
                  {
                    text: t(
                      'content.editAttachment.header.right.succeed.button'
                    ),
                    onPress: () => {
                      navigation.goBack()
                    }
                  }
                ]
              )
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

    []
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
            options={{ headerLeft, headerRight, headerCenter: () => null }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

export default ComposeEditAttachment
