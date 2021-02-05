import analytics from '@components/analytics'
import Icon from '@components/Icon'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import ComposeContext from '../utils/createContext'
import addAttachment from './Footer/addAttachment'

const ComposeActions: React.FC = () => {
  const { showActionSheetWithOptions } = useActionSheet()
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation('sharedCompose')
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
      analytics('compose_actions_attachment_press', {
        count: composeState.attachments.uploads.length
      })
      return await addAttachment({
        composeDispatch,
        showActionSheetWithOptions
      })
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
      analytics('compose_actions_poll_press', {
        current: composeState.poll.active
      })
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
      showActionSheetWithOptions(
        {
          title: t('content.root.actions.visibility.title'),
          options: [
            t('content.root.actions.visibility.options.public'),
            t('content.root.actions.visibility.options.unlisted'),
            t('content.root.actions.visibility.options.private'),
            t('content.root.actions.visibility.options.direct'),
            t('content.root.actions.visibility.options.cancel')
          ],
          cancelButtonIndex: 4
        },
        buttonIndex => {
          switch (buttonIndex) {
            case 0:
              analytics('compose_actions_visibility_press', {
                current: composeState.visibility,
                new: 'public'
              })
              composeDispatch({ type: 'visibility', payload: 'public' })
              break
            case 1:
              analytics('compose_actions_visibility_press', {
                current: composeState.visibility,
                new: 'unlisted'
              })
              composeDispatch({ type: 'visibility', payload: 'unlisted' })
              break
            case 2:
              analytics('compose_actions_visibility_press', {
                current: composeState.visibility,
                new: 'private'
              })
              composeDispatch({ type: 'visibility', payload: 'private' })
              break
            case 3:
              analytics('compose_actions_visibility_press', {
                current: composeState.visibility,
                new: 'direct'
              })
              composeDispatch({ type: 'visibility', payload: 'direct' })
              break
          }
        }
      )
    }
  }, [composeState.visibility])

  const spoilerOnPress = useCallback(() => {
    analytics('compose_actions_spoiler_press', {
      current: composeState.spoiler.active
    })
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
    analytics('compose_actions_emojis_press', {
      current: composeState.emoji.active
    })
    if (composeState.emoji.emojis) {
      layoutAnimation()
      composeDispatch({
        type: 'emoji',
        payload: { ...composeState.emoji, active: !composeState.emoji.active }
      })
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
