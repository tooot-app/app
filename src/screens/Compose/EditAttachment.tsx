import haptics from '@components/haptics'
import { HeaderLeft, HeaderRight } from '@components/Header'
import apiInstance from '@utils/api/instance'
import { ScreenComposeStackScreenProps } from '@utils/navigation/navigators'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ComposeEditAttachmentRoot from './EditAttachment/Root'
import ComposeContext from './utils/createContext'

const ComposeEditAttachment: React.FC<
  ScreenComposeStackScreenProps<'Screen-Compose-EditAttachment'>
> = ({
  navigation,
  route: {
    params: { index }
  }
}) => {
  const { t } = useTranslation('screenCompose')

  const { composeState } = useContext(ComposeContext)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const theAttachment = composeState.attachments.uploads[index].remote!

  useEffect(() => {
    navigation.setOptions({
      title: t('content.editAttachment.header.title'),
      headerLeft: () => (
        <HeaderLeft type='icon' content='ChevronDown' onPress={() => navigation.goBack()} />
      ),
      headerRight: () => (
        <HeaderRight
          accessibilityLabel={t('content.editAttachment.header.right.accessibilityLabel')}
          type='icon'
          content='Save'
          loading={isSubmitting}
          onPress={() => {
            setIsSubmitting(true)
            const formData = new FormData()
            if (theAttachment.description) {
              formData.append('description', theAttachment.description)
            }
            if (theAttachment.meta?.focus?.x !== 0 || theAttachment.meta.focus.y !== 0) {
              formData.append(
                'focus',
                `${theAttachment.meta?.focus?.x || 0},${-theAttachment.meta?.focus?.y || 0}`
              )
            }

            theAttachment?.id &&
              apiInstance<Mastodon.Attachment>({
                method: 'put',
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
                  Alert.alert(t('content.editAttachment.header.right.failed.title'), undefined, [
                    {
                      text: t('content.editAttachment.header.right.failed.button'),
                      style: 'cancel'
                    }
                  ])
                })
          }}
        />
      )
    })
  }, [theAttachment])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
        <ComposeEditAttachmentRoot index={index} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

export default ComposeEditAttachment
