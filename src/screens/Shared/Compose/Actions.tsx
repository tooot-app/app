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
import { PostAction, ComposeState } from '../Compose'
import addAttachments from './addAttachments'

export interface Props {
  textInputRef: React.RefObject<TextInput>
  composeState: ComposeState
  composeDispatch: Dispatch<PostAction>
}

const ComposeActions: React.FC<Props> = ({
  textInputRef,
  composeState,
  composeDispatch
}) => {
  const { theme } = useTheme()

  const getVisibilityIcon = () => {
    switch (composeState.visibility) {
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
    if (composeState.poll.active) return theme.disabled
    if (composeState.attachmentUploadProgress) return theme.primary

    if (composeState.attachments.uploads.length) {
      return theme.primary
    } else {
      return theme.secondary
    }
  }, [
    composeState.poll.active,
    composeState.attachments.uploads,
    composeState.attachmentUploadProgress
  ])
  const attachmentOnPress = useCallback(async () => {
    if (composeState.poll.active) return
    if (composeState.attachmentUploadProgress) return

    if (!composeState.attachments.uploads.length) {
      return await addAttachments({ composeState, composeDispatch })
    }
  }, [
    composeState.poll.active,
    composeState.attachments.uploads,
    composeState.attachmentUploadProgress
  ])

  const pollColor = useMemo(() => {
    if (composeState.attachments.uploads.length) return theme.disabled
    if (composeState.attachmentUploadProgress) return theme.disabled

    if (composeState.poll.active) {
      return theme.primary
    } else {
      return theme.secondary
    }
  }, [
    composeState.poll.active,
    composeState.attachments.uploads,
    composeState.attachmentUploadProgress
  ])
  const pollOnPress = useCallback(() => {
    if (
      !composeState.attachments.uploads.length &&
      !composeState.attachmentUploadProgress
    ) {
      composeDispatch({
        type: 'poll',
        payload: { ...composeState.poll, active: !composeState.poll.active }
      })
    }
    if (composeState.poll.active) {
      textInputRef.current?.focus()
    }
  }, [
    composeState.poll.active,
    composeState.attachments.uploads,
    composeState.attachmentUploadProgress
  ])

  const emojiColor = useMemo(() => {
    if (!composeState.emoji.emojis) return theme.disabled
    if (composeState.emoji.active) {
      return theme.primary
    } else {
      return theme.secondary
    }
  }, [composeState.emoji.active, composeState.emoji.emojis])
  const emojiOnPress = useCallback(() => {
    if (composeState.emoji.emojis) {
      if (composeState.emoji.active) {
        composeDispatch({
          type: 'emoji',
          payload: { ...composeState.emoji, active: false }
        })
      } else {
        composeDispatch({
          type: 'emoji',
          payload: { ...composeState.emoji, active: true }
        })
      }
    }
  }, [composeState.emoji.active, composeState.emoji.emojis])

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
                  composeDispatch({ type: 'visibility', payload: 'public' })
                  break
                case 1:
                  composeDispatch({ type: 'visibility', payload: 'unlisted' })
                  break
                case 2:
                  composeDispatch({ type: 'visibility', payload: 'private' })
                  break
                case 3:
                  composeDispatch({ type: 'visibility', payload: 'direct' })
                  break
              }
            }
          )
        }
      />
      <Feather
        name='alert-triangle'
        size={24}
        color={composeState.spoiler.active ? theme.primary : theme.secondary}
        onPress={() =>
          composeDispatch({
            type: 'spoiler',
            payload: { active: !composeState.spoiler.active }
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
