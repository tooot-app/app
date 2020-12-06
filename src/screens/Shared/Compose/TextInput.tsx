import React, { Dispatch, RefObject } from 'react'
import { StyleSheet, Text, TextInput } from 'react-native'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { PostAction, PostState } from '../Compose'
import formatText from './formatText'

export interface Props {
  postState: PostState
  postDispatch: Dispatch<PostAction>
  textInputRef: RefObject<TextInput>
}

const ComposeTextInput: React.FC<Props> = ({
  postState,
  postDispatch,
  textInputRef
}) => {
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
          postDispatch,
          content
        })
      }
      onSelectionChange={({
        nativeEvent: {
          selection: { start, end }
        }
      }) => {
        postDispatch({ type: 'selection', payload: { start, end } })
      }}
      ref={textInputRef}
      scrollEnabled
    >
      <Text>{postState.text.formatted}</Text>
    </TextInput>
  )
}

const styles = StyleSheet.create({
  textInput: {
    fontSize: StyleConstants.Font.Size.M,
    marginTop: StyleConstants.Spacing.S,
    paddingBottom: StyleConstants.Spacing.M,
    marginLeft: StyleConstants.Spacing.Global.PagePadding,
    marginRight: StyleConstants.Spacing.Global.PagePadding,
    // borderBottomWidth: 0.5
  }
})

export default React.memo(
  ComposeTextInput,
  (prev, next) =>
    prev.postState.text.formatted === next.postState.text.formatted
)
