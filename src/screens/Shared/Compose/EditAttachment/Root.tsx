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
  const { theme } = useTheme()
  const { composeState } = useContext(ComposeContext)
  const theAttachment = composeState.attachments.uploads[index].remote!

  const mediaDisplay = useMemo(() => {
    switch (theAttachment.type) {
      case 'image':
        return <ComposeEditAttachmentImage index={index} focus={focus} />
      case 'video':
      case 'gifv':
        const video = composeState.attachments.uploads[index]
        return (
          <AttachmentVideo
            sensitiveShown={false}
            video={
              video.local
                ? ({
                    url: video.local.uri,
                    preview_url: video.local.local_thumbnail,
                    blurhash: video.remote?.blurhash
                  } as Mastodon.AttachmentVideo)
                : (video.remote! as Mastodon.AttachmentVideo)
            }
          />
        )
    }
    return null
  }, [])

  return (
    <ScrollView>
      {mediaDisplay}
      <View style={styles.altTextContainer}>
        <Text style={[styles.altTextInputHeading, { color: theme.primary }]}>
          为附件添加文字说明
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
          placeholder={
            '你可以为附件添加文字说明，以便更多人可以查看他们（包括视力障碍或视力受损人士）。\n\n优质的描述应该简洁明了，但要准确地描述照片中的内容，以便用户理解其含义。'
          }
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
