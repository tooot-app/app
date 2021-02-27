import Icon from '@components/Icon'
import {
  RelationshipIncoming,
  RelationshipOutgoing
} from '@components/Relationship'
import { useNavigation } from '@react-navigation/native'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedMuted from './HeaderShared/Muted'
import HeaderSharedVisibility from './HeaderShared/Visibility'

export interface Props {
  queryKey: QueryKeyTimeline
  notification: Mastodon.Notification
}

const TimelineHeaderNotification = React.memo(
  ({ queryKey, notification }: Props) => {
    const navigation = useNavigation()
    const { theme } = useTheme()

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
                onPress={() =>
                  navigation.navigate('Screen-Actions', {
                    queryKey,
                    status: notification.status,
                    url: notification.status?.url || notification.status?.uri,
                    type: 'status'
                  })
                }
                children={
                  <Icon
                    name='MoreHorizontal'
                    color={theme.secondary}
                    size={StyleConstants.Font.Size.L}
                  />
                }
              />
            )
          }
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
  },
  () => true
)

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

export default TimelineHeaderNotification
