import { MAX_MEDIA_ATTACHMENTS } from '@components/mediaSelector'
import CustomText from '@components/Text'
import PasteInput, { PastedFile } from '@mattermost/react-native-paste-input'
import { useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import ComposeContext from '../../utils/createContext'
import { formatText } from '../../utils/processText'
import { uploadAttachment } from '../Footer/addAttachment'

const ComposeTextInput: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation(['common', 'screenCompose'])
  const { colors, mode } = useTheme()

  const [adaptiveFontsize] = useGlobalStorage.number('app.font_size')
  const adaptedFontsize = adaptiveScale(StyleConstants.Font.Size.M, adaptiveFontsize)
  const adaptedLineheight = adaptiveScale(StyleConstants.Font.LineHeight.M, adaptiveFontsize)

  return (
    <PasteInput
      keyboardAppearance={mode}
      keyboardType='twitter'
      style={{
        marginTop: StyleConstants.Spacing.S,
        paddingBottom: StyleConstants.Spacing.M,
        marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
        color: colors.primaryDefault,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.backgroundDefaultTransparent,
        fontSize: adaptedFontsize,
        lineHeight: adaptedLineheight
      }}
      autoFocus
      enablesReturnKeyAutomatically
      multiline
      placeholder={t('screenCompose:content.root.header.textInput.placeholder')}
      placeholderTextColor={colors.secondary}
      onChangeText={content =>
        formatText({
          textInput: 'text',
          composeDispatch,
          content
        })
      }
      onFocus={() => {
        composeDispatch({
          type: 'textInputFocus',
          payload: { current: 'text' }
        })
        composeState.textInputFocus.isFocused.text.current = true
      }}
      onBlur={() => {
        composeState.textInputFocus.isFocused.text.current = false
      }}
      onSelectionChange={({
        nativeEvent: {
          selection: { start, end }
        }
      }) => {
        composeDispatch({
          type: 'text',
          payload: { selection: { start, end } }
        })
      }}
      ref={composeState.textInputFocus.refs.text}
      scrollEnabled={false}
      disableCopyPaste={false}
      onPaste={(error: string | null | undefined, files: PastedFile[]) => {
        if (composeState.attachments.uploads.length + files.length > MAX_MEDIA_ATTACHMENTS()) {
          Alert.alert(
            t('screenCompose:content.root.header.textInput.keyboardImage.exceedMaximum.title'),
            undefined,
            [
              {
                text: t('common:buttons.OK'),
                style: 'default'
              }
            ]
          )
          return
        }

        for (const file of files) {
          uploadAttachment({ composeDispatch, media: file })
        }
      }}
    >
      <CustomText>{composeState.text.formatted}</CustomText>
    </PasteInput>
  )
}

export default ComposeTextInput
