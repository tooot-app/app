import client from '@api/client'
import { Feather } from '@expo/vector-icons'
import haptics from '@components/haptics'
import openLink from '@components/openLink'
import { ParseEmojis } from '@components/Parse'
import relativeTime from '@components/relativeTime'
import { toast } from '@components/toast'
import { relationshipFetch } from '@utils/fetches/relationshipFetch'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import { useQuery } from 'react-query'

export interface Props {
  notification: Mastodon.Notification
}

const TimelineHeaderNotification: React.FC<Props> = ({ notification }) => {
  const actualAccount = notification.status
    ? notification.status.account
    : notification.account
  const name = actualAccount.display_name || actualAccount.username
  const emojis = actualAccount.emojis
  const account = actualAccount.acct
  const { theme } = useTheme()

  const [since, setSince] = useState(relativeTime(notification.created_at))

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

  useEffect(() => {
    setTimeout(() => {
      setSince(relativeTime(notification.created_at))
    }, 1000)
  }, [since])

  const applicationOnPress = useCallback(
    async () =>
      notification.status?.application.website &&
      (await openLink(notification.status.application.website)),
    []
  )

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
        toast({ type: 'error', content: '请重试', autoHide: false })
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
      <View style={styles.nameAndMeta}>
        <View style={styles.nameAndAccount}>
          <Text numberOfLines={1}>
            <ParseEmojis content={name} emojis={emojis} fontBold />
          </Text>
          <Text
            style={[styles.account, { color: theme.secondary }]}
            numberOfLines={1}
          >
            @{account}
          </Text>
        </View>

        <View style={styles.meta}>
          <View>
            <Text style={[styles.created_at, { color: theme.secondary }]}>
              {since}
            </Text>
          </View>
          {notification.status?.visibility === 'private' && (
            <Feather
              name='lock'
              size={StyleConstants.Font.Size.S}
              color={theme.secondary}
              style={styles.visibility}
            />
          )}
          {notification.status?.application &&
            notification.status?.application.name !== 'Web' && (
              <View>
                <Text
                  onPress={applicationOnPress}
                  style={[styles.application, { color: theme.secondary }]}
                >
                  发自于 - {notification.status?.application.name}
                </Text>
              </View>
            )}
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
  nameAndMeta: {
    width: '80%'
  },
  nameAndAccount: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  account: {
    flexShrink: 1,
    marginLeft: StyleConstants.Spacing.XS
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: StyleConstants.Spacing.XS,
    marginBottom: StyleConstants.Spacing.S
  },
  created_at: {
    ...StyleConstants.FontStyle.S
  },
  visibility: {
    marginLeft: StyleConstants.Spacing.S
  },
  application: {
    ...StyleConstants.FontStyle.S,
    marginLeft: StyleConstants.Spacing.S
  },
  relationship: {
    flexBasis: '20%',
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

export default React.memo(TimelineHeaderNotification, () => true)
