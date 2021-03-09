import apiInstance from '@api/instance'
import analytics from '@components/analytics'
import haptics from '@components/haptics'
import { HeaderRight } from '@components/Header'
import { useNavigation } from '@react-navigation/native'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import ComposeContext from '../utils/createContext'

export interface Props {
  index: number
}

const ComposeEditAttachmentSubmit: React.FC<Props> = ({ index }) => {
  const { composeState } = useContext(ComposeContext)
  const navigation = useNavigation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useTranslation('sharedCompose')

  const theAttachment = composeState.attachments.uploads[index].remote!

  return (
    <HeaderRight
      type='icon'
      content='Save'
      loading={isSubmitting}
      onPress={() => {
        analytics('editattachment_confirm_press')

        setIsSubmitting(true)
        const formData = new FormData()
        if (theAttachment.description) {
          formData.append('description', theAttachment.description)
        }
        if (
          theAttachment.meta?.focus?.x !== 0 ||
          theAttachment.meta.focus.y !== 0
        ) {
          formData.append(
            'focus',
            `${theAttachment.meta.focus.x},${-theAttachment.meta.focus.y}`
          )
        }

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
            Alert.alert(
              t('content.editAttachment.header.right.failed.title'),
              undefined,
              [
                {
                  text: t('content.editAttachment.header.right.failed.button'),
                  style: 'cancel'
                }
              ]
            )
          })
      }}
    />
  )
}

export default ComposeEditAttachmentSubmit
