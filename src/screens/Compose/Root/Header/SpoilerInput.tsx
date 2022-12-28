import CustomText from '@components/Text'
import { useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native'
import ComposeContext from '../../utils/createContext'
import { formatText } from '../../utils/processText'

const ComposeSpoilerInput: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation('screenCompose')
  const { colors, mode } = useTheme()

  const [adaptiveFontsize] = useGlobalStorage.number('app.font_size')
  const adaptedFontsize = adaptiveScale(StyleConstants.Font.Size.M, adaptiveFontsize)
  const adaptedLineheight = adaptiveScale(StyleConstants.Font.LineHeight.M, adaptiveFontsize)

  return (
    <TextInput
      ref={composeState.textInputFocus.refs.spoiler}
      keyboardAppearance={mode}
      style={{
        ...StyleConstants.FontStyle.M,
        marginTop: StyleConstants.Spacing.S,
        paddingBottom: StyleConstants.Spacing.M,
        marginLeft: StyleConstants.Spacing.Global.PagePadding,
        marginRight: StyleConstants.Spacing.Global.PagePadding,
        borderBottomWidth: 0.5,
        color: colors.primaryDefault,
        borderBottomColor: colors.border,
        fontSize: adaptedFontsize,
        lineHeight: adaptedLineheight
      }}
      autoFocus
      enablesReturnKeyAutomatically
      multiline
      placeholder={t('content.root.header.spoilerInput.placeholder')}
      placeholderTextColor={colors.secondary}
      onChangeText={content =>
        formatText({
          textInput: 'spoiler',
          composeDispatch,
          content
        })
      }
      onSelectionChange={({
        nativeEvent: {
          selection: { start, end }
        }
      }) => {
        composeDispatch({
          type: 'spoiler',
          payload: { selection: { start, end } }
        })
      }}
      scrollEnabled={false}
      onFocus={() => {
        composeDispatch({
          type: 'textInputFocus',
          payload: { current: 'spoiler' }
        })
        composeState.textInputFocus.isFocused.spoiler.current = true
      }}
      onBlur={() => {
        composeState.textInputFocus.isFocused.spoiler.current = false
      }}
    >
      <CustomText>{composeState.spoiler.formatted}</CustomText>
    </TextInput>
  )
}

export default ComposeSpoilerInput
