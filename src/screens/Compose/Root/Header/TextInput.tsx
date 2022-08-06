import CustomText from '@components/Text'
import PasteInput, { PastedFile } from '@mattermost/react-native-paste-input'
import { getInstanceConfigurationStatusMaxAttachments } from '@utils/slices/instancesSlice'
import { getSettingsFontsize } from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useSelector } from 'react-redux'
import formatText from '../../formatText'
import ComposeContext from '../../utils/createContext'
import { uploadAttachment } from '../Footer/addAttachment'

const ComposeTextInput: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation('screenCompose')
  const { colors, mode } = useTheme()

  const maxAttachments = useSelector(
    getInstanceConfigurationStatusMaxAttachments,
    () => true
  )

  const adaptiveFontsize = useSelector(getSettingsFontsize)
  const adaptedFontsize = adaptiveScale(
    StyleConstants.Font.Size.M,
    adaptiveFontsize
  )
  const adaptedLineheight = adaptiveScale(
    StyleConstants.Font.LineHeight.M,
    adaptiveFontsize
  )

  return (
    <PasteInput
      keyboardAppearance={mode}
      style={{
        ...StyleConstants.FontStyle.M,
        marginTop: StyleConstants.Spacing.S,
        paddingBottom: StyleConstants.Spacing.M,
        marginLeft: StyleConstants.Spacing.Global.PagePadding,
        marginRight: StyleConstants.Spacing.Global.PagePadding,
        color: colors.primaryDefault,
        borderBottomColor: colors.border,
        fontSize: adaptedFontsize,
        lineHeight: adaptedLineheight
      }}
      autoFocus
      enablesReturnKeyAutomatically
      multiline
      placeholder={t('content.root.header.textInput.placeholder')}
      placeholderTextColor={colors.secondary}
      onChangeText={content =>
        formatText({
          textInput: 'text',
          composeDispatch,
          content
        })
      }
      onFocus={() =>
        composeDispatch({
          type: 'textInputFocus',
          payload: { current: 'text' }
        })
      }
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
        if (
          composeState.attachments.uploads.length + files.length >
          maxAttachments
        ) {
          Alert.alert(
            t(
              'content.root.header.textInput.keyboardImage.exceedMaximum.title'
            ),
            undefined,
            [
              {
                text: t(
                  'content.root.header.textInput.keyboardImage.exceedMaximum.OK'
                ),
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
