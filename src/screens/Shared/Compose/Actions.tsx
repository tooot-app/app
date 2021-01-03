import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useContext, useMemo } from 'react'
import { ActionSheetIOS, Pressable, StyleSheet, View } from 'react-native'
import addAttachment from './/addAttachment'
import ComposeContext from './utils/createContext'

const ComposeActions: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { theme } = useTheme()

  const attachmentColor = useMemo(() => {
    if (composeState.poll.active) return theme.disabled

    if (composeState.attachments.uploads.length) {
      return theme.primary
    } else {
      return theme.secondary
    }
  }, [composeState.poll.active, composeState.attachments.uploads])
  const attachmentOnPress = useCallback(async () => {
    if (composeState.poll.active) return

    if (composeState.attachments.uploads.length < 4) {
      return await addAttachment({ composeDispatch })
    }
  }, [composeState.poll.active, composeState.attachments.uploads])

  const pollColor = useMemo(() => {
    if (composeState.attachments.uploads.length) return theme.disabled

    if (composeState.poll.active) {
      return theme.primary
    } else {
      return theme.secondary
    }
  }, [composeState.poll.active, composeState.attachments.uploads])
  const pollOnPress = useCallback(() => {
    if (!composeState.attachments.uploads.length) {
      layoutAnimation()
      composeDispatch({
        type: 'poll',
        payload: { ...composeState.poll, active: !composeState.poll.active }
      })
    }
    if (composeState.poll.active) {
      composeState.textInputFocus.refs.text.current?.focus()
    }
  }, [composeState.poll.active, composeState.attachments.uploads])

  const visibilityIcon = useMemo(() => {
    switch (composeState.visibility) {
      case 'public':
        return 'Globe'
      case 'unlisted':
        return 'Unlock'
      case 'private':
        return 'Lock'
      case 'direct':
        return 'Mail'
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
    layoutAnimation()
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
        layoutAnimation()
        composeDispatch({
          type: 'emoji',
          payload: { ...composeState.emoji, active: false }
        })
      } else {
        layoutAnimation()
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
      <Pressable
        onPress={attachmentOnPress}
        children={<Icon name='Aperture' size={24} color={attachmentColor} />}
      />
      <Pressable
        onPress={pollOnPress}
        children={<Icon name='BarChart2' size={24} color={pollColor} />}
      />
      <Pressable
        onPress={visibilityOnPress}
        children={
          <Icon
            name={visibilityIcon}
            size={24}
            color={
              composeState.visibilityLock ? theme.disabled : theme.secondary
            }
          />
        }
      />
      <Pressable
        onPress={spoilerOnPress}
        children={
          <Icon
            name='AlertTriangle'
            size={24}
            color={
              composeState.spoiler.active ? theme.primary : theme.secondary
            }
          />
        }
      />
      <Pressable
        onPress={emojiOnPress}
        children={<Icon name='Smile' size={24} color={emojiColor} />}
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
