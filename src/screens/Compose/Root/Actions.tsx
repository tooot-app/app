import analytics from '@components/analytics'
import Icon from '@components/Icon'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { getInstanceConfigurationStatusMaxAttachments } from '@utils/slices/instancesSlice'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import ComposeContext from '../utils/createContext'
import chooseAndUploadAttachment from './Footer/addAttachment'

const ComposeActions: React.FC = () => {
  const { showActionSheetWithOptions } = useActionSheet()
  const { composeState, composeDispatch } = useContext(ComposeContext)
  const { t } = useTranslation('screenCompose')
  const { colors, mode } = useTheme()
  const instanceConfigurationStatusMaxAttachments = useSelector(
    getInstanceConfigurationStatusMaxAttachments,
    () => true
  )

  const attachmentColor = useMemo(() => {
    if (composeState.poll.active) return colors.disabled

    if (composeState.attachments.uploads.length) {
      return colors.primaryDefault
    } else {
      return colors.secondary
    }
  }, [composeState.poll.active, composeState.attachments.uploads])
  const attachmentOnPress = useCallback(async () => {
    if (composeState.poll.active) return

    if (
      composeState.attachments.uploads.length <
      instanceConfigurationStatusMaxAttachments
    ) {
      analytics('compose_actions_attachment_press', {
        count: composeState.attachments.uploads.length
      })
      return await chooseAndUploadAttachment({
        composeDispatch,
        showActionSheetWithOptions
      })
    }
  }, [composeState.poll.active, composeState.attachments.uploads])

  const pollColor = useMemo(() => {
    if (composeState.attachments.uploads.length) return colors.disabled

    if (composeState.poll.active) {
      return colors.primaryDefault
    } else {
      return colors.secondary
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
          cancelButtonIndex: 4,
          userInterfaceStyle: mode
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
    if (!composeState.emoji.emojis) return colors.disabled

    if (composeState.emoji.active) {
      return colors.primaryDefault
    } else {
      return colors.secondary
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
      accessibilityRole='toolbar'
      style={{
        height: 45,
        borderTopWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: colors.backgroundDefault,
        borderTopColor: colors.border
      }}
    >
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t(
          'content.root.actions.attachment.accessibilityLabel'
        )}
        accessibilityHint={t(
          'content.root.actions.attachment.accessibilityHint'
        )}
        accessibilityState={{
          disabled: composeState.poll.active
        }}
        style={styles.button}
        onPress={attachmentOnPress}
        children={<Icon name='Aperture' size={24} color={attachmentColor} />}
      />
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t('content.root.actions.poll.accessibilityLabel')}
        accessibilityHint={t('content.root.actions.poll.accessibilityHint')}
        accessibilityState={{
          disabled: composeState.attachments.uploads.length ? true : false,
          expanded: composeState.poll.active
        }}
        style={styles.button}
        onPress={pollOnPress}
        children={<Icon name='BarChart2' size={24} color={pollColor} />}
      />
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t(
          'content.root.actions.visibility.accessibilityLabel',
          { visibility: composeState.visibility }
        )}
        accessibilityState={{ disabled: composeState.visibilityLock }}
        style={styles.button}
        onPress={visibilityOnPress}
        children={
          <Icon
            name={visibilityIcon}
            size={24}
            color={
              composeState.visibilityLock ? colors.disabled : colors.secondary
            }
          />
        }
      />
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t(
          'content.root.actions.spoiler.accessibilityLabel'
        )}
        accessibilityState={{ expanded: composeState.spoiler.active }}
        style={styles.button}
        onPress={spoilerOnPress}
        children={
          <Icon
            name='AlertTriangle'
            size={24}
            color={
              composeState.spoiler.active
                ? colors.primaryDefault
                : colors.secondary
            }
          />
        }
      />
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t('content.root.actions.emoji.accessibilityLabel')}
        accessibilityHint={t('content.root.actions.emoji.accessibilityHint')}
        accessibilityState={{
          disabled: composeState.emoji.emojis ? false : true,
          expanded: composeState.emoji.active
        }}
        style={styles.button}
        onPress={emojiOnPress}
        children={<Icon name='Smile' size={24} color={emojiColor} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  }
})

export default ComposeActions
