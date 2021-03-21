import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TextInput } from 'react-native'
import formatText from '../../formatText'
import ComposeContext from '../../utils/createContext'

const ComposeTextInput: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation('sharedCompose')
  const { mode, theme } = useTheme()

  return (
    <TextInput
      keyboardAppearance={mode}
      style={[
        styles.textInput,
        {
          color: theme.primaryDefault,
          borderBottomColor: theme.border
        }
      ]}
      autoCapitalize='none'
      autoCorrect={false}
      autoFocus
      enablesReturnKeyAutomatically
      multiline
      placeholder={t('content.root.header.textInput.placeholder')}
      placeholderTextColor={theme.secondary}
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
    >
      <Text>{composeState.text.formatted}</Text>
    </TextInput>
  )
}

const styles = StyleSheet.create({
  textInput: {
    ...StyleConstants.FontStyle.M,
    marginTop: StyleConstants.Spacing.S,
    paddingBottom: StyleConstants.Spacing.M,
    marginLeft: StyleConstants.Spacing.Global.PagePadding,
    marginRight: StyleConstants.Spacing.Global.PagePadding
  }
})

export default ComposeTextInput
