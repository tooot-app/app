import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native'
import formatText from '../../formatText'
import ComposeContext from '../../utils/createContext'

const ComposeSpoilerInput: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation('screenCompose')
  const { colors, mode } = useTheme()

  return (
    <TextInput
      keyboardAppearance={mode}
      style={{
        ...StyleConstants.FontStyle.M,
        marginTop: StyleConstants.Spacing.S,
        paddingBottom: StyleConstants.Spacing.M,
        marginLeft: StyleConstants.Spacing.Global.PagePadding,
        marginRight: StyleConstants.Spacing.Global.PagePadding,
        borderBottomWidth: 0.5,
        color: colors.primaryDefault,
        borderBottomColor: colors.border
      }}
      autoCapitalize='none'
      autoCorrect={false}
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
      onFocus={() =>
        composeDispatch({
          type: 'textInputFocus',
          payload: { current: 'spoiler' }
        })
      }
    >
      <CustomText>{composeState.spoiler.formatted}</CustomText>
    </TextInput>
  )
}

export default ComposeSpoilerInput
