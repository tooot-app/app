import { Feather } from '@expo/vector-icons'
import React, { Dispatch, useCallback, useMemo } from 'react'
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

  const attachmentColor = useMemo(() => {
    if (postState.poll.active) return theme.disabled
    if (postState.attachmentUploadProgress) return theme.primary

    if (postState.attachments.uploads.length) {
      return theme.primary
    } else {
      return theme.secondary
    }
  }, [
    postState.poll.active,
    postState.attachments.uploads,
    postState.attachmentUploadProgress
  ])
  const attachmentOnPress = useCallback(async () => {
    if (postState.poll.active) return
    if (postState.attachmentUploadProgress) return

    if (!postState.attachments.uploads.length) {
      return await addAttachments({ postState, postDispatch })
    }
  }, [
    postState.poll.active,
    postState.attachments.uploads,
    postState.attachmentUploadProgress
  ])

  const pollColor = useMemo(() => {
    if (postState.attachments.uploads.length) return theme.disabled
    if (postState.attachmentUploadProgress) return theme.disabled

    if (postState.poll.active) {
      return theme.primary
    } else {
      return theme.secondary
    }
  }, [
    postState.poll.active,
    postState.attachments.uploads,
    postState.attachmentUploadProgress
  ])
  const pollOnPress = useCallback(() => {
    if (
      !postState.attachments.uploads.length &&
      !postState.attachmentUploadProgress
    ) {
      postDispatch({
        type: 'poll',
        payload: { ...postState.poll, active: !postState.poll.active }
      })
    }
    if (postState.poll.active) {
      textInputRef.current?.focus()
    }
  }, [
    postState.poll.active,
    postState.attachments.uploads,
    postState.attachmentUploadProgress
  ])

  const emojiColor = useMemo(() => {
    if (!postState.emoji.emojis) return theme.disabled
    if (postState.emoji.active) {
      return theme.primary
    } else {
      return theme.secondary
    }
  }, [postState.emoji.active, postState.emoji.emojis])
  const emojiOnPress = useCallback(() => {
    if (postState.emoji.emojis) {
      if (postState.emoji.active) {
        postDispatch({
          type: 'emoji',
          payload: { ...postState.emoji, active: false }
        })
      } else {
        postDispatch({
          type: 'emoji',
          payload: { ...postState.emoji, active: true }
        })
      }
    }
  }, [postState.emoji.active, postState.emoji.emojis])

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
        color={attachmentColor}
        onPress={attachmentOnPress}
      />
      <Feather
        name='bar-chart-2'
        size={24}
        color={pollColor}
        onPress={pollOnPress}
      />
      <Feather
        name={getVisibilityIcon()}
        size={24}
        color={theme.secondary}
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
        name='alert-triangle'
        size={24}
        color={postState.spoiler.active ? theme.primary : theme.secondary}
        onPress={() =>
          postDispatch({
            type: 'spoiler',
            payload: { active: !postState.spoiler.active }
          })
        }
      />
      <Feather
        name='smile'
        size={24}
        color={emojiColor}
        onPress={emojiOnPress}
      />
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
