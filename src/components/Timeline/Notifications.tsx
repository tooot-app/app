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
import React, { useCallback, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useSelector } from 'react-redux'
import * as ContextMenu from 'zeego/context-menu'
import StatusContext from './Shared/Context'
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
  const instanceAccount = useSelector(getInstanceAccount, () => true)

  const status = notification.status?.reblog ? notification.status.reblog : notification.status
  const account = notification.status ? notification.status.account : notification.account
  const ownAccount = notification.account?.id === instanceAccount?.id
  const [spoilerExpanded, setSpoilerExpanded] = useState(
    instanceAccount.preferences['reading:expand:spoilers'] || false
  )
  const spoilerHidden = notification.status?.spoiler_text?.length
    ? !instanceAccount.preferences['reading:expand:spoilers'] && !spoilerExpanded
    : false
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
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()

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
            isNotification
            account={notification.account}
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
            <TimelineAvatar account={account} />
            <TimelineHeaderNotification notification={notification} />
          </View>

          {notification.status ? (
            <View
              style={{
                paddingTop: highlighted ? StyleConstants.Spacing.S : 0,
                paddingLeft: highlighted ? 0 : StyleConstants.Avatar.M + StyleConstants.Spacing.S
              }}
            >
              <TimelineContent
                notificationOwnToot={['favourite', 'reblog'].includes(notification.type)}
                setSpoilerExpanded={setSpoilerExpanded}
              />
              <TimelinePoll />
              <TimelineAttachment />
              <TimelineCard />
              <TimelineFullConversation />
            </View>
          ) : null}
        </View>

        <TimelineActions />
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
    <StatusContext.Provider
      value={{
        queryKey,
        status,
        ownAccount,
        spoilerHidden,
        copiableContent,
        highlighted
      }}
    >
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
      <TimelineHeaderAndroid />
    </StatusContext.Provider>
  )
}

export default TimelineNotifications
