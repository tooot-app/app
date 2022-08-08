import contextMenuAccount from '@components/ContextMenu/account'
import contextMenuInstance from '@components/ContextMenu/instance'
import contextMenuShare from '@components/ContextMenu/share'
import contextMenuStatus from '@components/ContextMenu/status'
import Icon from '@components/Icon'
import {
  RelationshipIncoming,
  RelationshipOutgoing
} from '@components/Relationship'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { Pressable, View } from 'react-native'
import ContextMenu, { ContextMenuAction } from 'react-native-context-menu-view'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedMuted from './HeaderShared/Muted'
import HeaderSharedVisibility from './HeaderShared/Visibility'

export interface Props {
  queryKey: QueryKeyTimeline
  notification: Mastodon.Notification
}

const TimelineHeaderNotification = ({ queryKey, notification }: Props) => {
  const { colors } = useTheme()

  const contextMenuActions: ContextMenuAction[] = []
  const status = notification.status
  const shareOnPress =
    status && status?.visibility !== 'direct'
      ? contextMenuShare({
          actions: contextMenuActions,
          type: 'status',
          url: status.url || status.uri
        })
      : null
  const statusOnPress = contextMenuStatus({
    actions: contextMenuActions,
    status: status!,
    queryKey
  })
  const accountOnPress = contextMenuAccount({
    actions: contextMenuActions,
    type: 'status',
    queryKey,
    id: status!.account.id
  })
  const instanceOnPress = contextMenuInstance({
    actions: contextMenuActions,
    status: status!,
    queryKey
  })

  const actions = useMemo(() => {
    switch (notification.type) {
      case 'follow':
        return <RelationshipOutgoing id={notification.account.id} />
      case 'follow_request':
        return <RelationshipIncoming id={notification.account.id} />
      default:
        if (notification.status) {
          return (
            <Pressable
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                paddingBottom: StyleConstants.Spacing.S
              }}
              children={
                <ContextMenu
                  dropdownMenuMode
                  actions={contextMenuActions}
                  onPress={({ nativeEvent: { index } }) => {
                    for (const on of [
                      shareOnPress,
                      statusOnPress,
                      accountOnPress,
                      instanceOnPress
                    ]) {
                      on && on(index)
                    }
                  }}
                  children={
                    <Icon
                      name='MoreHorizontal'
                      color={colors.secondary}
                      size={StyleConstants.Font.Size.L}
                    />
                  }
                />
              }
            />
          )
        }
    }
  }, [notification.type])

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View
        style={{
          flex:
            notification.type === 'follow' ||
            notification.type === 'follow_request'
              ? 1
              : 4
        }}
      >
        <HeaderSharedAccount
          account={
            notification.status
              ? notification.status.account
              : notification.account
          }
          {...((notification.type === 'follow' ||
            notification.type === 'follow_request') && { withoutName: true })}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: StyleConstants.Spacing.XS,
            marginBottom: StyleConstants.Spacing.S
          }}
        >
          <HeaderSharedCreated
            created_at={
              notification.status?.created_at || notification.created_at
            }
            edited_at={notification.status?.edited_at}
          />
          {notification.status?.visibility ? (
            <HeaderSharedVisibility
              visibility={notification.status.visibility}
            />
          ) : null}
          <HeaderSharedMuted muted={notification.status?.muted} />
          <HeaderSharedApplication
            application={notification.status?.application}
          />
        </View>
      </View>

      <View
        style={[
          { marginLeft: StyleConstants.Spacing.M },
          notification.type === 'follow' ||
          notification.type === 'follow_request'
            ? { flexShrink: 1 }
            : { flex: 1 }
        ]}
      >
        {actions}
      </View>
    </View>
  )
}

export default TimelineHeaderNotification
