import menuInstance from '@components/contextMenu/instance'
import menuShare from '@components/contextMenu/share'
import menuStatus from '@components/contextMenu/status'
import TimelineActioned from '@components/Timeline/Shared/Actioned'
import TimelineActions from '@components/Timeline/Shared/Actions'
import TimelineAttachment from '@components/Timeline/Shared/Attachment'
import TimelineAvatar from '@components/Timeline/Shared/Avatar'
import TimelineCard from '@components/Timeline/Shared/Card'
import TimelineContent from '@components/Timeline/Shared/Content'
import TimelineHeaderNotification from '@components/Timeline/Shared/HeaderNotification'
import TimelinePoll from '@components/Timeline/Shared/Poll'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { uniqBy } from 'lodash'
import React, { useCallback, useRef } from 'react'
import { Pressable, View } from 'react-native'
import { useSelector } from 'react-redux'
import * as ContextMenu from 'zeego/context-menu'
import TimelineFiltered, { shouldFilter } from './Shared/Filtered'
import TimelineFullConversation from './Shared/FullConversation'
import TimelineHeaderAndroid from './Shared/HeaderAndroid'

export interface Props {
  notification: Mastodon.Notification
  queryKey: QueryKeyTimeline
  highlighted?: boolean
}

const TimelineNotifications: React.FC<Props> = ({
  notification,
  queryKey,
  highlighted = false
}) => {
  const copiableContent = useRef<{ content: string; complete: boolean }>({
    content: '',
    complete: false
  })

  const filtered =
    notification.status &&
    shouldFilter({
      copiableContent,
      status: notification.status,
      queryKey
    })
  if (notification.status && filtered) {
    return <TimelineFiltered phrase={filtered} />
  }

  const { colors } = useTheme()
  const instanceAccount = useSelector(getInstanceAccount, (prev, next) => prev?.id === next?.id)
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  const actualAccount = notification.status ? notification.status.account : notification.account

  const onPress = useCallback(() => {
    notification.status &&
      navigation.push('Tab-Shared-Toot', {
        toot: notification.status,
        rootQueryKey: queryKey
      })
  }, [])

  const main = () => {
    return (
      <>
        {notification.type !== 'mention' ? (
          <TimelineActioned
            action={notification.type}
            account={notification.account}
            notification
          />
        ) : null}

        <View
          style={{
            opacity:
              notification.type === 'follow' ||
              notification.type === 'follow_request' ||
              notification.type === 'mention' ||
              notification.type === 'status'
                ? 1
                : 0.5
          }}
        >
          <View style={{ flex: 1, width: '100%', flexDirection: 'row' }}>
            <TimelineAvatar queryKey={queryKey} account={actualAccount} highlighted={highlighted} />
            <TimelineHeaderNotification queryKey={queryKey} notification={notification} />
          </View>

          {notification.status ? (
            <View
              style={{
                paddingTop: highlighted ? StyleConstants.Spacing.S : 0,
                paddingLeft: highlighted ? 0 : StyleConstants.Avatar.M + StyleConstants.Spacing.S
              }}
            >
              {notification.status.content.length > 0 ? (
                <TimelineContent status={notification.status} highlighted={highlighted} />
              ) : null}
              {notification.status.poll ? (
                <TimelinePoll
                  queryKey={queryKey}
                  statusId={notification.status.id}
                  poll={notification.status.poll}
                  reblog={false}
                  sameAccount={notification.account.id === instanceAccount?.id}
                />
              ) : null}
              {notification.status.media_attachments.length > 0 ? (
                <TimelineAttachment status={notification.status} />
              ) : null}
              {notification.status.card ? <TimelineCard card={notification.status.card} /> : null}
              <TimelineFullConversation queryKey={queryKey} status={notification.status} />
            </View>
          ) : null}
        </View>

        {notification.status ? (
          <TimelineActions
            queryKey={queryKey}
            status={notification.status}
            highlighted={highlighted}
            accts={uniqBy(
              ([notification.status.account] as Mastodon.Account[] & Mastodon.Mention[])
                .concat(notification.status.mentions)
                .filter(d => d?.id !== instanceAccount?.id),
              d => d?.id
            ).map(d => d?.acct)}
            reblog={false}
          />
        ) : null}
      </>
    )
  }

  const mShare = menuShare({
    visibility: notification.status?.visibility,
    type: 'status',
    url: notification.status?.url || notification.status?.uri,
    copiableContent
  })
  const mStatus = menuStatus({ status: notification.status, queryKey })
  const mInstance = menuInstance({ status: notification.status, queryKey })

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <Pressable
            style={{
              padding: StyleConstants.Spacing.Global.PagePadding,
              backgroundColor: colors.backgroundDefault,
              paddingBottom: notification.status ? 0 : StyleConstants.Spacing.Global.PagePadding
            }}
            onPress={onPress}
            onLongPress={() => {}}
            children={main()}
          />
        </ContextMenu.Trigger>

        <ContextMenu.Content>
          {mShare.map((mGroup, index) => (
            <ContextMenu.Group key={index}>
              {mGroup.map(menu => (
                <ContextMenu.Item key={menu.key} {...menu.item}>
                  <ContextMenu.ItemTitle children={menu.title} />
                  <ContextMenu.ItemIcon iosIconName={menu.icon} />
                </ContextMenu.Item>
              ))}
            </ContextMenu.Group>
          ))}

          {mStatus.map((mGroup, index) => (
            <ContextMenu.Group key={index}>
              {mGroup.map(menu => (
                <ContextMenu.Item key={menu.key} {...menu.item}>
                  <ContextMenu.ItemTitle children={menu.title} />
                  <ContextMenu.ItemIcon iosIconName={menu.icon} />
                </ContextMenu.Item>
              ))}
            </ContextMenu.Group>
          ))}

          {mInstance.map((mGroup, index) => (
            <ContextMenu.Group key={index}>
              {mGroup.map(menu => (
                <ContextMenu.Item key={menu.key} {...menu.item}>
                  <ContextMenu.ItemTitle children={menu.title} />
                  <ContextMenu.ItemIcon iosIconName={menu.icon} />
                </ContextMenu.Item>
              ))}
            </ContextMenu.Group>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Root>
      <TimelineHeaderAndroid queryKey={queryKey} status={notification.status} />
    </>
  )
}

export default TimelineNotifications
