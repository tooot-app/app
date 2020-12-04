import { Feather } from '@expo/vector-icons'
import React, { Dispatch } from 'react'
import {
  ActionSheetIOS,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput
} from 'react-native'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { PostAction, PostState } from '../Compose'
import addAttachments from './addAttachments'

export interface Props {
  textInputRef: React.RefObject<TextInput>
  postState: PostState
  postDispatch: Dispatch<PostAction>
}

const ComposeActions: React.FC<Props> = ({
  textInputRef,
  postState,
  postDispatch
}) => {
  const { theme } = useTheme()

  const getVisibilityIcon = () => {
    switch (postState.visibility) {
      case 'public':
        return 'globe'
      case 'unlisted':
        return 'unlock'
      case 'private':
        return 'lock'
      case 'direct':
        return 'mail'
    }
  }

  return (
    <Pressable
      style={[
        styles.additions,
        { backgroundColor: theme.background, borderTopColor: theme.border }
      ]}
      onPress={() => Keyboard.dismiss()}
    >
      <Feather
        name='aperture'
        size={24}
        color={postState.poll.active ? theme.secondary : theme.primary}
        onPress={async () =>
          !postState.poll.active &&
          (await addAttachments({ postState, postDispatch }))
        }
      />
      <Feather
        name='bar-chart-2'
        size={24}
        color={
          postState.attachments.length > 0 ? theme.secondary : theme.primary
        }
        onPress={() => {
          if (postState.attachments.length === 0) {
            postDispatch({
              type: 'poll',
              payload: { ...postState.poll, active: !postState.poll.active }
            })
          }
          if (postState.poll.active) {
            textInputRef.current?.focus()
          }
        }}
      />
      <Feather
        name={getVisibilityIcon()}
        size={24}
        color={theme.primary}
        onPress={() =>
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: ['公开', '不公开', '仅关注着', '私信', '取消'],
              cancelButtonIndex: 4
            },
            buttonIndex => {
              switch (buttonIndex) {
                case 0:
                  postDispatch({ type: 'visibility', payload: 'public' })
                  break
                case 1:
                  postDispatch({ type: 'visibility', payload: 'unlisted' })
                  break
                case 2:
                  postDispatch({ type: 'visibility', payload: 'private' })
                  break
                case 3:
                  postDispatch({ type: 'visibility', payload: 'direct' })
                  break
              }
            }
          )
        }
      />
      <Feather
        name='smile'
        size={24}
        color={postState.emoji.emojis?.length ? theme.primary : theme.secondary}
        {...(postState.emoji.emojis && {
          onPress: () => {
            if (postState.emoji.active) {
              postDispatch({
                type: 'emoji',
                payload: { ...postState.emoji, active: false }
              })
            } else {
              Keyboard.dismiss()
              postDispatch({
                type: 'emoji',
                payload: { ...postState.emoji, active: true }
              })
            }
          }
        })}
      />
      <Text
        style={[
          styles.count,
          { color: postState.text.count < 0 ? theme.error : theme.primary }
        ]}
      >
        {postState.text.count}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  additions: {
    height: 45,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  count: {
    textAlign: 'center',
    fontSize: StyleConstants.Font.Size.M,
    fontWeight: StyleConstants.Font.Weight.Bold
  }
})

export default ComposeActions
