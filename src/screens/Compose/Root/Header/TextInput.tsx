import CustomText from '@components/Text'
import { getInstanceConfigurationStatusMaxAttachments } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, TextInput } from 'react-native'
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

  return (
    <TextInput
      keyboardAppearance={mode}
      style={{
        ...StyleConstants.FontStyle.M,
        marginTop: StyleConstants.Spacing.S,
        paddingBottom: StyleConstants.Spacing.M,
        marginLeft: StyleConstants.Spacing.Global.PagePadding,
        marginRight: StyleConstants.Spacing.Global.PagePadding,
        color: colors.primaryDefault,
        borderBottomColor: colors.border
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
      onImageChange={({ nativeEvent }) => {
        if (composeState.attachments.uploads.length >= maxAttachments) {
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
        if (nativeEvent.linkUri) {
          uploadAttachment({
            composeDispatch,
            imageInfo: {
              uri: nativeEvent.linkUri,
              type: 'image',
              width: 100,
              height: 100
            }
          })
        }
      }}
    >
      <CustomText>{composeState.text.formatted}</CustomText>
    </TextInput>
  )
}

export default ComposeTextInput
