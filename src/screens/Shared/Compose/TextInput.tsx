import React, { useContext } from 'react'
import { StyleSheet, Text, TextInput } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import formatText from './formatText'
import ComposeContext from './utils/createContext'

const ComposeTextInput: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { theme } = useTheme()

  return (
    <TextInput
      style={[
        styles.textInput,
        {
          color: theme.primary,
          borderBottomColor: theme.border
        }
      ]}
      autoCapitalize='none'
      autoCorrect={false}
      autoFocus
      enablesReturnKeyAutomatically
      multiline
      placeholder='想说点什么'
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
      scrollEnabled
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
