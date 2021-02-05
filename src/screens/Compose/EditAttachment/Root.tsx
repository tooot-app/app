import AttachmentVideo from '@components/Timelines/Timeline/Shared/Attachment/Video'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useContext,
  useMemo
} from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import ComposeContext from '../utils/createContext'
import ComposeEditAttachmentImage from './Image'

export interface Props {
  index: number
  focus: MutableRefObject<{
    x: number
    y: number
  }>
  altText: string | undefined
  setAltText: Dispatch<SetStateAction<string | undefined>>
}

const ComposeEditAttachmentRoot: React.FC<Props> = ({
  index,
  focus,
  altText,
  setAltText
}) => {
  const { t } = useTranslation('sharedCompose')
  const { theme } = useTheme()
  const { composeState } = useContext(ComposeContext)
  const theAttachment = composeState.attachments.uploads[index].remote

  const mediaDisplay = useMemo(() => {
    if (theAttachment) {
      switch (theAttachment.type) {
        case 'image':
          return <ComposeEditAttachmentImage index={index} focus={focus} />
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
                      preview_url: video.local.local_thumbnail,
                      blurhash: video.remote?.blurhash
                    } as Mastodon.AttachmentVideo)
                  : (video.remote as Mastodon.AttachmentVideo)
              }
            />
          )
      }
    }
    return null
  }, [])

  return (
    <ScrollView>
      {mediaDisplay}
      <View style={styles.altTextContainer}>
        <Text style={[styles.altTextInputHeading, { color: theme.primary }]}>
          {t('content.editAttachment.content.altText.heading')}
        </Text>
        <TextInput
          style={[
            styles.altTextInput,
            { borderColor: theme.border, color: theme.primary }
          ]}
          autoCapitalize='none'
          autoCorrect={false}
          maxLength={1500}
          multiline
          onChangeText={e => setAltText(e)}
          placeholder={t('content.editAttachment.content.altText.placeholder')}
          placeholderTextColor={theme.secondary}
          scrollEnabled
          value={altText}
        />
        <Text style={[styles.altTextLength, { color: theme.secondary }]}>
          {altText?.length || 0} / 1500
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  altTextContainer: { padding: StyleConstants.Spacing.Global.PagePadding },
  altTextInputHeading: {
    ...StyleConstants.FontStyle.M,
    fontWeight: StyleConstants.Font.Weight.Bold
  },
  altTextInput: {
    height: 200,
    ...StyleConstants.FontStyle.M,
    marginTop: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.S,
    padding: StyleConstants.Spacing.Global.PagePadding,
    paddingTop: StyleConstants.Spacing.S * 1.5,
    borderWidth: StyleSheet.hairlineWidth
  },
  altTextLength: {
    textAlign: 'right',
    marginRight: StyleConstants.Spacing.S,
    ...StyleConstants.FontStyle.S,
    marginBottom: StyleConstants.Spacing.M
  }
})

export default ComposeEditAttachmentRoot
