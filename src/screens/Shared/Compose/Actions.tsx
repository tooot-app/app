import { Feather } from '@expo/vector-icons'
import React, { RefObject, useCallback, useContext, useMemo } from 'react'
import { ActionSheetIOS, StyleSheet, TextInput, View } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { ComposeContext } from '@screens/Shared/Compose'
import addAttachments from '@screens/Shared/Compose/addAttachments'
import { toast } from '@root/components/toast'

const ComposeActions: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { theme } = useTheme()

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
      composeState.textInputFocus.refs.text.current?.focus()
    }
  }, [
    composeState.poll.active,
    composeState.attachments.uploads,
    composeState.attachmentUploadProgress
  ])

  const visibilityIcon = useMemo(() => {
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
  }, [composeState.visibility])
  const visibilityOnPress = useCallback(() => {
    if (!composeState.visibilityLock) {
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
  }, [])

  const spoilerOnPress = useCallback(() => {
    if (composeState.spoiler.active) {
      composeState.textInputFocus.refs.text.current?.focus()
    }
    composeDispatch({
      type: 'spoiler',
      payload: { active: !composeState.spoiler.active }
    })
  }, [composeState.spoiler.active, composeState.textInputFocus])

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
    <View
      style={[
        styles.additions,
        { backgroundColor: theme.background, borderTopColor: theme.border }
      ]}
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
        name={visibilityIcon}
        size={24}
        color={composeState.visibilityLock ? theme.disabled : theme.secondary}
        onPress={visibilityOnPress}
      />
      <Feather
        name='alert-triangle'
        size={24}
        color={composeState.spoiler.active ? theme.primary : theme.secondary}
        onPress={spoilerOnPress}
      />
      <Feather
        name='smile'
        size={24}
        color={emojiColor}
        onPress={emojiOnPress}
      />
    </View>
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
    ...StyleConstants.FontStyle.M,
    fontWeight: StyleConstants.Font.Weight.Bold
  }
})

export default ComposeActions
