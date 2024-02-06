import { discardConfirmation } from '@components/discardConfirmation'
import haptics from '@components/haptics'
import { HeaderLeft, HeaderRight } from '@components/Header'
import { ModalScrollView } from '@components/ModalScrollView'
import CustomText from '@components/Text'
import apiInstance from '@utils/api/instance'
import { ScreenComposeStackScreenProps } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { Image } from 'expo-image'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, TextInput, View } from 'react-native'
import { DEFAULT_WIDTH } from './Root/Footer/Attachments'
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
  const { t } = useTranslation(['common', 'screenCompose'])

  const { composeState, composeDispatch } = useContext(ComposeContext)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const theAttachment = composeState.attachments.uploads[index].remote
  if (!theAttachment) {
    navigation.goBack()
    return null
  }

  const [altText, setAltText] = useState<string | undefined>(theAttachment.description)

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderLeft
          content='chevron-down'
          onPress={() => {
            discardConfirmation({
              condition: theAttachment.description != altText,
              action: () => navigation.goBack()
            })
          }}
        />
      ),
      headerRight: () => (
        <HeaderRight
          accessibilityLabel={t(
            'screenCompose:content.editAttachment.header.right.accessibilityLabel'
          )}
          type='text'
          content={t('common:buttons.apply')}
          loading={isSubmitting}
          onPress={() => {
            if (composeState.type === 'edit') {
              composeDispatch({
                type: 'attachment/edit',
                payload: { ...theAttachment, description: altText }
              })
              navigation.goBack()
              return
            }

            theAttachment?.id &&
              apiInstance<Mastodon.Attachment>({
                method: 'put',
                url: `media/${theAttachment.id}`,
                body: { description: altText }
              })
                .then(res => {
                  setIsSubmitting(false)
                  haptics('Success')
                  composeDispatch({
                    type: 'attachment/edit',
                    payload: res.body
                  })
                  navigation.goBack()
                })
                .catch(() => {
                  setIsSubmitting(false)
                  haptics('Error')
                  Alert.alert(
                    t('screenCompose:content.editAttachment.header.right.failed.title'),
                    undefined,
                    [
                      {
                        text: t('screenCompose:content.editAttachment.header.right.failed.button'),
                        style: 'cancel'
                      }
                    ]
                  )
                })
          }}
        />
      )
    })
  }, [theAttachment, altText])

  return (
    <ModalScrollView>
      <View style={{ alignItems: 'center', marginBottom: StyleConstants.Spacing.M }}>
        <Image
          style={{
            width: DEFAULT_WIDTH,
            height: DEFAULT_WIDTH,
            borderRadius: StyleConstants.BorderRadius / 2
          }}
          source={theAttachment.preview_url}
        />
      </View>
      <CustomText fontStyle='M' style={{ color: colors.primaryDefault }} fontWeight='Bold'>
        {t('screenCompose:content.editAttachment.content.altText.heading')}
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
        value={altText}
        onChangeText={e => setAltText(e)}
        placeholder={t('screenCompose:content.editAttachment.content.altText.placeholder')}
        placeholderTextColor={colors.secondary}
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
