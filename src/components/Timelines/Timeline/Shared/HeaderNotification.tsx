import { RelationshipOutgoing } from '@components/Relationship'
import { StyleConstants } from '@utils/styles/constants'
import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedVisibility from './HeaderShared/Visibility'
import RelationshipIncoming from '@root/components/Relationship/Incoming'
import HeaderSharedMuted from './HeaderShared/Muted'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import ScreenActions from '@screens/Actions'

export interface Props {
  queryKey: QueryKeyTimeline
  notification: Mastodon.Notification
}

const TimelineHeaderNotification: React.FC<Props> = ({
  queryKey,
  notification
}) => {
  const actions = useMemo(() => {
    switch (notification.type) {
      case 'follow':
        return <RelationshipOutgoing id={notification.account.id} />
      case 'follow_request':
        return <RelationshipIncoming id={notification.account.id} />
      default:
        return notification.status ? (
          <ScreenActions queryKey={queryKey} status={notification.status} />
        ) : null
    }
  }, [notification.type])
  return (
    <View style={styles.base}>
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
        <View style={styles.meta}>
          <HeaderSharedCreated created_at={notification.created_at} />
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
          styles.relationship,
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

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row'
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: StyleConstants.Spacing.XS,
    marginBottom: StyleConstants.Spacing.S
  },
  relationship: {
    marginLeft: StyleConstants.Spacing.M
  }
})

export default React.memo(TimelineHeaderNotification, () => true)
