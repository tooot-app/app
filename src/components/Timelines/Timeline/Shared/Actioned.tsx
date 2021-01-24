import analytics from '@components/analytics'
import Icon from '@components/Icon'
import { ParseEmojis } from '@components/Parse'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'

export interface Props {
  account: Mastodon.Account
  action: Mastodon.Notification['type'] | ('reblog' | 'pinned')
  notification?: boolean
}

const TimelineActioned: React.FC<Props> = ({
  account,
  action,
  notification = false
}) => {
  const { t } = useTranslation('componentTimeline')
  const { theme } = useTheme()
  const navigation = useNavigation<
    StackNavigationProp<Nav.LocalStackParamList>
  >()
  const name = account.display_name || account.username
  const iconColor = theme.primary

  const content = (content: string) => (
    <ParseEmojis content={content} emojis={account.emojis} size='S' />
  )

  const onPress = useCallback(() => {
    analytics('timeline_shared_actioned_press', { action })
    navigation.push('Screen-Shared-Account', { account })
  }, [])

  const children = useMemo(() => {
    switch (action) {
      case 'pinned':
        return (
          <>
            <Icon
              name='Anchor'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            {content(t('shared.actioned.pinned'))}
          </>
        )
        break
      case 'favourite':
        return (
          <>
            <Icon
              name='Heart'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            <Pressable onPress={onPress}>
              {content(t('shared.actioned.favourite', { name }))}
            </Pressable>
          </>
        )
        break
      case 'follow':
        return (
          <>
            <Icon
              name='UserPlus'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            <Pressable onPress={onPress}>
              {content(t('shared.actioned.follow', { name }))}
            </Pressable>
          </>
        )
        break
      case 'follow_request':
        return (
          <>
            <Icon
              name='UserPlus'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            <Pressable onPress={onPress}>
              {content(t('shared.actioned.follow_request', { name }))}
            </Pressable>
          </>
        )
        break
      case 'poll':
        return (
          <>
            <Icon
              name='BarChart2'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            {content(t('shared.actioned.poll'))}
          </>
        )
        break
      case 'reblog':
        return (
          <>
            <Icon
              name='Repeat'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            <Pressable onPress={onPress}>
              {content(
                notification
                  ? t('shared.actioned.reblog.notification', { name })
                  : t('shared.actioned.reblog.default', { name })
              )}
            </Pressable>
          </>
        )
        break
      case 'status':
        return (
          <>
            <Icon
              name='Activity'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            <Pressable onPress={onPress}>
              {content(t('shared.actioned.status', { name }))}
            </Pressable>
          </>
        )
        break
    }
  }, [])

  return <View style={styles.actioned} children={children} />
}

const styles = StyleSheet.create({
  actioned: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: StyleConstants.Spacing.S,
    paddingLeft: StyleConstants.Avatar.M - StyleConstants.Font.Size.S,
    paddingRight: StyleConstants.Spacing.Global.PagePadding
  },
  icon: {
    marginRight: StyleConstants.Spacing.S
  }
})

export default React.memo(TimelineActioned, () => true)
