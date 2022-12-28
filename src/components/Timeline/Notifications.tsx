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
import { featureCheck } from '@helpers/featureCheck'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { usePreferencesQuery } from '@utils/queryHooks/preferences'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Fragment, useCallback, useState } from 'react'
import { Pressable, View } from 'react-native'
import * as ContextMenu from 'zeego/context-menu'
import StatusContext from './Shared/Context'
import TimelineFiltered, { FilteredProps, shouldFilter } from './Shared/Filtered'
import TimelineFullConversation from './Shared/FullConversation'
import TimelineHeaderAndroid from './Shared/HeaderAndroid'

export interface Props {
  notification: Mastodon.Notification
  queryKey: QueryKeyTimeline
}

const TimelineNotifications: React.FC<Props> = ({ notification, queryKey }) => {
  const [accountId] = useAccountStorage.string('auth.account.id')
  const { data: preferences } = usePreferencesQuery()

  const status = notification.status?.reblog ? notification.status.reblog : notification.status
  const account =
    notification.type === 'admin.report'
      ? notification.report.target_account
      : notification.status
      ? notification.status.account
      : notification.account
  const ownAccount = notification.account?.id === accountId
  const [spoilerExpanded, setSpoilerExpanded] = useState(
    preferences?.['reading:expand:spoilers'] || false
  )
  const spoilerHidden = notification.status?.spoiler_text?.length
    ? !preferences?.['reading:expand:spoilers'] && !spoilerExpanded
    : false

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
              notification.type === 'status' ||
              notification.type === 'admin.sign_up'
                ? 1
                : 0.5
          }}
        >
          <View style={{ flex: 1, width: '100%', flexDirection: 'row' }}>
            <TimelineAvatar account={account} />
            <TimelineHeaderNotification notification={notification} />
          </View>

          {notification.status ? (
            <View style={{ paddingLeft: StyleConstants.Avatar.M + StyleConstants.Spacing.S }}>
              <TimelineContent
                notificationOwnToot={['favourite', 'reblog'].includes(notification.type)}
                setSpoilerExpanded={setSpoilerExpanded}
              />
              <TimelinePoll />
              <TimelineAttachment />
              <TimelineCard />
              <TimelineFullConversation />

              <TimelineActions />
            </View>
          ) : null}
        </View>
      </>
    )
  }

  const mShare = menuShare({
    visibility: notification.status?.visibility,
    type: 'status',
    url: notification.status?.url || notification.status?.uri
  })
  const mStatus = menuStatus({ status: notification.status, queryKey })
  const mInstance = menuInstance({ status: notification.status, queryKey })

  if (!ownAccount) {
    let filterResults: FilteredProps['filterResults'] = []
    const [filterRevealed, setFilterRevealed] = useState(false)
    const hasFilterServerSide = featureCheck('filter_server_side')
    if (notification.status) {
      if (hasFilterServerSide) {
        if (notification.status.filtered?.length) {
          filterResults = notification.status.filtered.map(filter => filter.filter)
        }
      } else {
        const checkFilter = shouldFilter({ queryKey, status: notification.status })
        if (checkFilter?.length) {
          filterResults = checkFilter
        }
      }

      if (filterResults?.length && !filterRevealed) {
        return !filterResults.filter(result => result.filter_action === 'hide').length ? (
          <Pressable onPress={() => setFilterRevealed(!filterRevealed)}>
            <TimelineFiltered filterResults={filterResults} />
          </Pressable>
        ) : null
      }
    }
  }

  return (
    <StatusContext.Provider
      value={{
        queryKey,
        status,
        ownAccount,
        spoilerHidden
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
          {[mShare, mStatus, mInstance].map((type, i) => (
            <Fragment key={i}>
              {type.map((mGroup, index) => (
                <ContextMenu.Group key={index}>
                  {mGroup.map(menu => (
                    <ContextMenu.Item key={menu.key} {...menu.item}>
                      <ContextMenu.ItemTitle children={menu.title} />
                      <ContextMenu.ItemIcon ios={{ name: menu.icon }} />
                    </ContextMenu.Item>
                  ))}
                </ContextMenu.Group>
              ))}
            </Fragment>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Root>
      <TimelineHeaderAndroid />
    </StatusContext.Provider>
  )
}

export default TimelineNotifications
