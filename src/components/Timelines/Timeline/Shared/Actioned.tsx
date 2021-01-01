import { ParseEmojis } from '@components/Parse'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'

export interface Props {
  account: Mastodon.Account
  action: 'favourite' | 'follow' | 'poll' | 'reblog' | 'pinned' | 'mention'
  notification?: boolean
}

const TimelineActioned: React.FC<Props> = ({
  account,
  action,
  notification = false
}) => {
  const { t } = useTranslation('timeline')
  const { theme } = useTheme()
  const navigation = useNavigation()
  const name = account.display_name || account.username
  const iconColor = theme.primary

  const content = (content: string) => (
    <ParseEmojis content={content} emojis={account.emojis} size='S' />
  )

  const onPress = useCallback(() => {
    navigation.push('Screen-Shared-Account', { account })
  }, [])

  const children = useMemo(() => {
    switch (action) {
      case 'pinned':
        return (
          <>
            <Feather
              name='anchor'
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
            <Feather
              name='heart'
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
            <Feather
              name='user-plus'
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
      case 'poll':
        return (
          <>
            <Feather
              name='bar-chart-2'
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
            <Feather
              name='repeat'
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
    }
  }, [])

  return <View style={styles.actioned} children={children} />
}

const styles = StyleSheet.create({
  actioned: {
    flexDirection: 'row',
    marginBottom: StyleConstants.Spacing.S,
    paddingLeft: StyleConstants.Avatar.M - StyleConstants.Font.Size.S,
    paddingRight: StyleConstants.Spacing.Global.PagePadding
  },
  icon: {
    paddingRight: StyleConstants.Spacing.S
  }
})

export default React.memo(TimelineActioned, () => true)
