import Icon from '@components/Icon'
import { ParseEmojis } from '@components/Parse'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import StatusContext from './Context'

export interface Props {
  action: Mastodon.Notification['type'] | 'reblog' | 'pinned'
  isNotification?: boolean
  account?: Mastodon.Account // For notification
  rootStatus?: Mastodon.Status
}

const TimelineActioned: React.FC<Props> = ({ action, isNotification, ...rest }) => {
  const { status } = useContext(StatusContext)
  const account = rest.account || (rest.rootStatus || status)?.account
  if (!account) return null

  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()
  const name = account?.display_name || account?.username
  const iconColor = colors.primaryDefault

  const content = (content: string) => (
    <ParseEmojis
      content={content}
      emojis={account.emojis}
      size='S'
      style={{ color: action === 'admin.report' ? colors.red : colors.primaryDefault }}
    />
  )

  const onPress = () =>
    navigation.push('Tab-Shared-Account', { account, isRemote: status?._remote })

  const children = () => {
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
                isNotification
                  ? t('shared.actioned.reblog.notification', { name })
                  : t('shared.actioned.reblog.default', { name })
              )}
            </Pressable>
          </>
        )
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
      case 'update':
        return (
          <>
            <Icon
              name='BarChart2'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            {content(t('shared.actioned.update'))}
          </>
        )
      case 'admin.sign_up':
        return (
          <>
            <Icon
              name='Users'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            {content(t('shared.actioned.admin.sign_up', { name: `@${account.acct}` }))}
          </>
        )
      case 'admin.report':
        return (
          <>
            <Icon
              name='AlertOctagon'
              size={StyleConstants.Font.Size.S}
              color={colors.red}
              style={styles.icon}
            />
            {content(t('shared.actioned.admin.report', { name: `@${account.acct}` }))}
          </>
        )
      default:
        return <></>
    }
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: StyleConstants.Spacing.S,
        paddingLeft: StyleConstants.Avatar.M - StyleConstants.Font.Size.S,
        paddingRight: StyleConstants.Spacing.Global.PagePadding
      }}
      children={children()}
    />
  )
}

const styles = StyleSheet.create({
  icon: {
    marginRight: StyleConstants.Spacing.S
  }
})

export default TimelineActioned
