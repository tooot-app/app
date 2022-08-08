import analytics from '@components/analytics'
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
import { isEqual, uniqBy } from 'lodash'
import React, { useCallback, useRef } from 'react'
import { Pressable, View } from 'react-native'
import { useSelector } from 'react-redux'
import TimelineContextMenu from './Shared/ContextMenu'
import TimelineFiltered, { shouldFilter } from './Shared/Filtered'
import TimelineFullConversation from './Shared/FullConversation'

export interface Props {
  notification: Mastodon.Notification
  queryKey: QueryKeyTimeline
  highlighted?: boolean
}

const TimelineNotifications = React.memo(
  ({ notification, queryKey, highlighted = false }: Props) => {
    const copiableContent = useRef<{ content: string; complete: boolean }>({
      content: '',
      complete: false
    })

    if (
      notification.status &&
      shouldFilter({ copiableContent, status: notification.status, queryKey })
    ) {
      return <TimelineFiltered />
    }

    const { colors } = useTheme()
    const instanceAccount = useSelector(
      getInstanceAccount,
      (prev, next) => prev?.id === next?.id
    )
    const navigation =
      useNavigation<StackNavigationProp<TabLocalStackParamList>>()

    const actualAccount = notification.status
      ? notification.status.account
      : notification.account

    const onPress = useCallback(() => {
      analytics('timeline_notification_press')
      notification.status &&
        navigation.push('Tab-Shared-Toot', {
          toot: notification.status,
          rootQueryKey: queryKey
        })
    }, [])

    return (
      <TimelineContextMenu
        copiableContent={copiableContent}
        status={notification.status}
        queryKey={queryKey}
      >
        <Pressable
          style={{
            padding: StyleConstants.Spacing.Global.PagePadding,
            backgroundColor: colors.backgroundDefault,
            paddingBottom: notification.status
              ? 0
              : StyleConstants.Spacing.Global.PagePadding
          }}
          onPress={onPress}
          onLongPress={() => {}}
        >
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
              <TimelineAvatar
                queryKey={queryKey}
                account={actualAccount}
                highlighted={highlighted}
              />
              <TimelineHeaderNotification
                queryKey={queryKey}
                notification={notification}
              />
            </View>

            {notification.status ? (
              <View
                style={{
                  paddingTop: highlighted ? StyleConstants.Spacing.S : 0,
                  paddingLeft: highlighted
                    ? 0
                    : StyleConstants.Avatar.M + StyleConstants.Spacing.S
                }}
              >
                {notification.status.content.length > 0 ? (
                  <TimelineContent
                    status={notification.status}
                    highlighted={highlighted}
                  />
                ) : null}
                {notification.status.poll ? (
                  <TimelinePoll
                    queryKey={queryKey}
                    statusId={notification.status.id}
                    poll={notification.status.poll}
                    reblog={false}
                    sameAccount={
                      notification.account.id === instanceAccount?.id
                    }
                  />
                ) : null}
                {notification.status.media_attachments.length > 0 ? (
                  <TimelineAttachment status={notification.status} />
                ) : null}
                {notification.status.card ? (
                  <TimelineCard card={notification.status.card} />
                ) : null}
                <TimelineFullConversation
                  queryKey={queryKey}
                  status={notification.status}
                />
              </View>
            ) : null}
          </View>

          {notification.status ? (
            <TimelineActions
              queryKey={queryKey}
              status={notification.status}
              highlighted={highlighted}
              accts={uniqBy(
                (
                  [notification.status.account] as Mastodon.Account[] &
                    Mastodon.Mention[]
                )
                  .concat(notification.status.mentions)
                  .filter(d => d?.id !== instanceAccount?.id),
                d => d?.id
              ).map(d => d?.acct)}
              reblog={false}
            />
          ) : null}
        </Pressable>
      </TimelineContextMenu>
    )
  },
  (prev, next) => isEqual(prev.notification, next.notification)
)

export default TimelineNotifications
