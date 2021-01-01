import client from '@api/client'
import { Feather } from '@expo/vector-icons'
import haptics from '@components/haptics'
import { toast } from '@components/toast'
import { relationshipFetch } from '@utils/fetches/relationshipFetch'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import { useQuery } from 'react-query'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedVisibility from './HeaderShared/Visibility'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedAccount from './HeaderShared/Account'

export interface Props {
  notification: Mastodon.Notification
}

const TimelineHeaderNotification: React.FC<Props> = ({ notification }) => {
  const { theme } = useTheme()

  const { status, data, refetch } = useQuery(
    ['Relationship', { id: notification.account.id }],
    relationshipFetch,
    {
      enabled: false
    }
  )
  const [updateData, setUpdateData] = useState<
    Mastodon.Relationship | undefined
  >()

  const relationshipOnPress = useCallback(() => {
    client({
      method: 'post',
      instance: 'local',
      url: `accounts/${notification.account.id}/${
        updateData
          ? updateData.following || updateData.requested
            ? 'un'
            : ''
          : data!.following || data!.requested
          ? 'un'
          : ''
      }follow`
    }).then(res => {
      if (res.body.id === (updateData && updateData.id) || data!.id) {
        setUpdateData(res.body)
        haptics('Success')
        return Promise.resolve()
      } else {
        haptics('Error')
        toast({ type: 'error', message: '请重试', autoHide: false })
        return Promise.reject()
      }
    })
  }, [data, updateData])

  useEffect(() => {
    if (notification.type === 'follow') {
      refetch()
    }
  }, [notification.type])
  const relationshipIcon = useMemo(() => {
    switch (status) {
      case 'idle':
      case 'loading':
        return (
          <Chase size={StyleConstants.Font.Size.L} color={theme.secondary} />
        )
      case 'success':
        return (
          <Pressable onPress={relationshipOnPress}>
            <Feather
              name={
                updateData
                  ? updateData.following
                    ? 'user-check'
                    : updateData.requested
                    ? 'loader'
                    : 'user-plus'
                  : data!.following
                  ? 'user-check'
                  : data!.requested
                  ? 'loader'
                  : 'user-plus'
              }
              color={
                updateData
                  ? updateData.following
                    ? theme.primary
                    : theme.secondary
                  : data!.following
                  ? theme.primary
                  : theme.secondary
              }
              size={StyleConstants.Font.Size.M + 2}
            />
          </Pressable>
        )
      default:
        return null
    }
  }, [status, data, updateData])

  return (
    <View style={styles.base}>
      <View style={styles.accountAndMeta}>
        <HeaderSharedAccount
          account={
            notification.status
              ? notification.status.account
              : notification.account
          }
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
        <View style={styles.relationship}>{relationshipIcon}</View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row'
  },
  accountAndMeta: {
    flex: 4
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: StyleConstants.Spacing.XS,
    marginBottom: StyleConstants.Spacing.S
  },
  relationship: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

export default React.memo(TimelineHeaderNotification, () => true)
