import Icon from '@components/Icon'
import { ParseEmojis } from '@components/Parse'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { getAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import StatusContext from './Context'
import GracefullyImage from '@components/GracefullyImage'

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
      style={{ flex: 1, color: action === 'admin.report' ? colors.red : colors.primaryDefault }}
    />
  )

  const onPress = () => navigation.push('Tab-Shared-Account', { account })
  const miniAvatar = (
    <GracefullyImage
      sources={{
        default: { uri: account.avatar },
        static: { uri: account.avatar_static }
      }}
      dimension={{
        width: StyleConstants.Avatar.XS / 1.5,
        height: StyleConstants.Avatar.XS / 1.5
      }}
      style={{
        borderRadius: 99,
        overflow: 'hidden',
        marginRight: StyleConstants.Spacing.S
      }}
      dim
      withoutTransition
    />
  )

  const children = () => {
    switch (action) {
      case 'pinned':
        return (
          <>
            <Icon
              name='anchor'
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
              name='heart'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {miniAvatar}
              {content(t('shared.actioned.favourite', { name }))}
            </Pressable>
          </>
        )
      case 'follow':
        return (
          <>
            <Icon
              name='user-plus'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {miniAvatar}
              {content(t('shared.actioned.follow', { name }))}
            </Pressable>
          </>
        )
      case 'follow_request':
        return (
          <>
            <Icon
              name='user-plus'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {miniAvatar}
              {content(t('shared.actioned.follow_request', { name }))}
            </Pressable>
          </>
        )
      case 'poll':
        return (
          <>
            <Icon
              name='bar-chart-2'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            {content(t('shared.actioned.poll'))}
          </>
        )
      case 'reblog':
        const myself = rest.rootStatus?.account.id === getAccountStorage.string('auth.account.id')
        return (
          <>
            <Icon
              name='repeat'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {!myself ? miniAvatar : null}
              {content(
                isNotification
                  ? t('shared.actioned.reblog.notification', { name })
                  : myself
                  ? t('shared.actioned.reblog.myself')
                  : t('shared.actioned.reblog.default', { name })
              )}
            </Pressable>
          </>
        )
      case 'status':
        return (
          <>
            <Icon
              name='activity'
              size={StyleConstants.Font.Size.S}
              color={iconColor}
              style={styles.icon}
            />
            <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {miniAvatar}
              {content(t('shared.actioned.status', { name }))}
            </Pressable>
          </>
        )
      case 'update':
        return (
          <>
            <Icon
              name='bar-chart-2'
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
              name='users'
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
              name='alert-octagon'
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
