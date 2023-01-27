import haptics from '@components/haptics'
import { HeaderLeft, HeaderRight } from '@components/Header'
import { ModalScrollView } from '@components/ModalScrollView'
import CustomText from '@components/Text'
import apiInstance from '@utils/api/instance'
import { ScreenComposeStackScreenProps } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, TextInput } from 'react-native'
import ComposeContext from './utils/createContext'

const ComposeEditAttachment: React.FC<
  ScreenComposeStackScreenProps<'Screen-Compose-EditAttachment'>
> = ({
  navigation,
  route: {
    params: { index }
  }
}) => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenCompose')

  const { composeState, composeDispatch } = useContext(ComposeContext)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const theAttachment = composeState.attachments.uploads[index].remote
  if (!theAttachment) {
    navigation.goBack()
    return null
  }

  useEffect(() => {
    navigation.setOptions({
      title: t('content.editAttachment.header.title'),
      headerLeft: () => <HeaderLeft content='chevron-down' onPress={() => navigation.goBack()} />,
      headerRight: () => (
        <HeaderRight
          accessibilityLabel={t('content.editAttachment.header.right.accessibilityLabel')}
          content='save'
          loading={isSubmitting}
          onPress={() => {
            if (composeState.type === 'edit') {
              composeDispatch({ type: 'attachment/edit', payload: { ...theAttachment } })
              navigation.goBack()
              return
            }

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
    <ModalScrollView>
      <CustomText fontStyle='M' style={{ color: colors.primaryDefault }} fontWeight='Bold'>
        {t('content.editAttachment.content.altText.heading')}
      </CustomText>
      <TextInput
        style={{
          height: StyleConstants.Font.Size.M * 11 + StyleConstants.Spacing.Global.PagePadding * 2,
          ...StyleConstants.FontStyle.M,
          marginTop: StyleConstants.Spacing.M,
          marginBottom: StyleConstants.Spacing.S,
          padding: StyleConstants.Spacing.Global.PagePadding,
          borderWidth: 1,
          borderColor: colors.border,
          color: colors.primaryDefault
        }}
        maxLength={1500}
        multiline
        onChangeText={e =>
          composeDispatch({
            type: 'attachment/edit',
            payload: {
              ...theAttachment,
              description: e
            }
          })
        }
        placeholder={t('content.editAttachment.content.altText.placeholder')}
        placeholderTextColor={colors.secondary}
        value={theAttachment.description}
      />
      <CustomText
        fontStyle='S'
        style={{
          textAlign: 'right',
          marginRight: StyleConstants.Spacing.S,
          marginBottom: StyleConstants.Spacing.M,
          color: colors.secondary
        }}
      >
        {theAttachment.description?.length || 0} / 1500
      </CustomText>
    </ModalScrollView>
  )
}

export default ComposeEditAttachment
