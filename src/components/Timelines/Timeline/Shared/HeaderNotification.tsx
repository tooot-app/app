import { RelationshipOutgoing } from '@components/Relationship'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedVisibility from './HeaderShared/Visibility'
import RelationshipIncoming from '@root/components/Relationship/Incoming'

export interface Props {
  notification: Mastodon.Notification
}

const TimelineHeaderNotification: React.FC<Props> = ({ notification }) => {
  return (
    <View style={styles.base}>
      <View style={styles.accountAndMeta}>
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
          <HeaderSharedVisibility
            visibility={notification.status?.visibility}
          />
          <HeaderSharedApplication
            application={notification.status?.application}
          />
        </View>
      </View>

      {notification.type === 'follow' && (
        <View style={styles.relationship}>
          <RelationshipOutgoing id={notification.account.id} />
        </View>
      )}
      {notification.type === 'follow_request' && (
        <View style={styles.relationship}>
          <RelationshipIncoming id={notification.account.id} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  accountAndMeta: {
    flex: 1,
    flexGrow: 1
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: StyleConstants.Spacing.XS,
    marginBottom: StyleConstants.Spacing.S
  },
  relationship: {
    flexShrink: 1,
    marginLeft: StyleConstants.Spacing.M
  }
})

export default React.memo(TimelineHeaderNotification, () => true)
