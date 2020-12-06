import React, { Dispatch, RefObject } from 'react'
import { StyleSheet, Text, TextInput } from 'react-native'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { PostAction, PostState } from '../Compose'
import formatText from './formatText'

export interface Props {
  postState: PostState
  postDispatch: Dispatch<PostAction>
  // textInputRef: RefObject<TextInput>
}

const ComposeSpoilerInput: React.FC<Props> = ({
  postState,
  postDispatch,
  // textInputRef
}) => {
  const { theme } = useTheme()

  return (
    <TextInput
      style={[
        styles.spoilerInput,
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
      placeholder='折叠部分的警告信息'
      placeholderTextColor={theme.secondary}
      onChangeText={content =>
        formatText({
          origin: 'spoiler',
          postDispatch,
          content
        })
      }
      onSelectionChange={({
        nativeEvent: {
          selection: { start, end }
        }
      }) => {
        postDispatch({
          type: 'spoiler',
          payload: { selection: { start, end } }
        })
      }}
      // ref={textInputRef}
      scrollEnabled
    >
      <Text>{postState.spoiler.formatted}</Text>
    </TextInput>
  )
}

const styles = StyleSheet.create({
  spoilerInput: {
    fontSize: StyleConstants.Font.Size.M,
    marginTop: StyleConstants.Spacing.S,
    paddingBottom: StyleConstants.Spacing.M,
    marginLeft: StyleConstants.Spacing.Global.PagePadding,
    marginRight: StyleConstants.Spacing.Global.PagePadding,
    borderBottomWidth: 0.5
  }
})

export default React.memo(
  ComposeSpoilerInput,
  (prev, next) =>
    prev.postState.spoiler.formatted === next.postState.spoiler.formatted
)
