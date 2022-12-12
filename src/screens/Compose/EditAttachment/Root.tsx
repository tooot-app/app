import CustomText from '@components/Text'
import AttachmentVideo from '@components/Timeline/Shared/Attachment/Video'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import ComposeContext from '../utils/createContext'
import ComposeEditAttachmentImage from './Image'

export interface Props {
  index: number
}

const ComposeEditAttachmentRoot: React.FC<Props> = ({ index }) => {
  const { t } = useTranslation('screenCompose')
  const { colors, mode } = useTheme()
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const theAttachment = composeState.attachments.uploads[index].remote!

  const mediaDisplay = () => {
    if (theAttachment) {
      switch (theAttachment.type) {
        case 'image':
          return <ComposeEditAttachmentImage index={index} />
        case 'video':
        case 'gifv':
          const video = composeState.attachments.uploads[index]
          return (
            <AttachmentVideo
              total={1}
              index={0}
              sensitiveShown={false}
              video={
                video.local
                  ? ({
                      url: video.local.uri,
                      preview_url: video.local.thumbnail,
                      blurhash: video.remote?.blurhash
                    } as Mastodon.AttachmentVideo)
                  : (video.remote as Mastodon.AttachmentVideo)
              }
            />
          )
      }
    }
    return null
  }

  return (
    <ScrollView>
      <View style={{ padding: StyleConstants.Spacing.Global.PagePadding, paddingBottom: 0 }}>
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
            borderWidth: StyleSheet.hairlineWidth,
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
          keyboardAppearance={mode}
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
      </View>
      {mediaDisplay()}
    </ScrollView>
  )
}

export default ComposeEditAttachmentRoot
