import { emojis } from '@components/Emojis'
import EmojisContext from '@components/Emojis/helpers/EmojisContext'
import Icon from '@components/Icon'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { getInstanceConfigurationStatusMaxAttachments } from '@utils/slices/instancesSlice'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, Pressable, StyleSheet, View } from 'react-native'
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
  const attachmentOnPress = () => {
    if (composeState.poll.active) return

    if (composeState.attachments.uploads.length < instanceConfigurationStatusMaxAttachments) {
      return chooseAndUploadAttachment({
        composeDispatch,
        showActionSheetWithOptions
      })
    }
  }

  const pollColor = useMemo(() => {
    if (composeState.attachments.uploads.length) return colors.disabled

    if (composeState.poll.active) {
      return colors.primaryDefault
    } else {
      return colors.secondary
    }
  }, [composeState.poll.active, composeState.attachments.uploads])
  const pollOnPress = () => {
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
  }

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
  const visibilityOnPress = () => {
    if (!composeState.visibilityLock) {
      showActionSheetWithOptions(
        {
          title: t('content.root.actions.visibility.title'),
          options: [
            t('content.root.actions.visibility.options.public'),
            t('content.root.actions.visibility.options.unlisted'),
            t('content.root.actions.visibility.options.private'),
            t('content.root.actions.visibility.options.direct'),
            t('common:buttons.cancel')
          ],
          cancelButtonIndex: 4,
          userInterfaceStyle: mode
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
  }

  const spoilerOnPress = () => {
    if (composeState.spoiler.active) {
      composeState.textInputFocus.refs.text.current?.focus()
    }
    layoutAnimation()
    composeDispatch({
      type: 'spoiler',
      payload: { active: !composeState.spoiler.active }
    })
  }

  const { emojisState, emojisDispatch } = useContext(EmojisContext)
  const emojiColor = useMemo(() => {
    if (!emojis.current?.length) return colors.disabled

    if (emojisState.targetIndex !== -1) {
      return colors.primaryDefault
    } else {
      return colors.secondary
    }
  }, [emojis.current?.length, emojisState.targetIndex])
  const emojiOnPress = () => {
    if (emojisState.targetIndex === -1) {
      Keyboard.dismiss()
      const focusedPropsIndex = emojisState.inputProps?.findIndex(props => props.isFocused.current)
      if (focusedPropsIndex === -1) return
      emojisDispatch({ type: 'target', payload: focusedPropsIndex })
    } else {
      emojisDispatch({ type: 'target', payload: -1 })
      return
    }
  }

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
        accessibilityLabel={t('content.root.actions.attachment.accessibilityLabel')}
        accessibilityHint={t('content.root.actions.attachment.accessibilityHint')}
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
        accessibilityLabel={t('content.root.actions.visibility.accessibilityLabel', {
          visibility: composeState.visibility
        })}
        accessibilityState={{ disabled: composeState.visibilityLock }}
        style={styles.button}
        onPress={visibilityOnPress}
        children={
          <Icon
            name={visibilityIcon}
            size={24}
            color={composeState.visibilityLock ? colors.disabled : colors.secondary}
          />
        }
      />
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t('content.root.actions.spoiler.accessibilityLabel')}
        accessibilityState={{ expanded: composeState.spoiler.active }}
        style={styles.button}
        onPress={spoilerOnPress}
        children={
          <Icon
            name='AlertTriangle'
            size={24}
            color={composeState.spoiler.active ? colors.primaryDefault : colors.secondary}
          />
        }
      />
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={t('content.root.actions.emoji.accessibilityLabel')}
        accessibilityHint={t('content.root.actions.emoji.accessibilityHint')}
        accessibilityState={{
          disabled: emojis.current?.length ? false : true,
          expanded: emojisState.targetIndex !== -1
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
