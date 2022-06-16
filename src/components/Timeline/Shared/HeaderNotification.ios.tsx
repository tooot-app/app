import Icon from '@components/Icon'
import {
  RelationshipIncoming,
  RelationshipOutgoing
} from '@components/Relationship'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useMemo } from 'react'
import { Pressable, View } from 'react-native'
import ContextMenu from 'react-native-context-menu-view'
import { ContextMenuContext } from './ContextMenu'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedMuted from './HeaderShared/Muted'
import HeaderSharedVisibility from './HeaderShared/Visibility'

export interface Props {
  queryKey: QueryKeyTimeline
  notification: Mastodon.Notification
}

const TimelineHeaderNotification = ({ notification }: Props) => {
  const { colors } = useTheme()

  const contextMenuContext = useContext(ContextMenuContext)

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
                  actions={contextMenuContext}
                  onPress={() => {}}
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
