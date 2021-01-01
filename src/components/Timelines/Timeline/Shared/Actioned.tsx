import { Feather } from '@expo/vector-icons'
import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'
import React, { useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { ParseEmojis } from '@root/components/Parse'
import { useNavigation } from '@react-navigation/native'

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
            {content('置顶')}
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
              {content(`${name} 喜欢了你的嘟嘟`)}
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
              {content(`${name} 开始关注你`)}
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
            {content('你参与的投票已结束')}
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
              {content(`${name} 转嘟了${notification ? '你的嘟嘟' : ''}`)}
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
