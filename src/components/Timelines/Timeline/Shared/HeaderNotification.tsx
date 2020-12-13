import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'

import Emojis from './Emojis'
import relativeTime from 'src/utils/relativeTime'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'
import { useQuery } from 'react-query'
import { relationshipFetch } from 'src/utils/fetches/relationshipFetch'
import client from 'src/api/client'
import { toast } from 'src/components/toast'

export interface Props {
  notification: Mastodon.Notification
}

const TimelineHeaderNotification: React.FC<Props> = ({ notification }) => {
  const name =
    notification.account.display_name || notification.account.username
  const emojis = notification.account.emojis
  const account = notification.account.acct
  const { theme } = useTheme()

  const navigation = useNavigation()
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

  const applicationOnPress = useCallback(() => {
    navigation.navigate('Screen-Shared-Webview', {
      uri: notification.status?.application!.website
    })
  }, [])

  const relationshipOnPress = useCallback(() => {
    client({
      method: 'post',
      instance: 'local',
      url: `accounts/${notification.account.id}/${
        updateData
          ? updateData.following || updateData.requested
            ? 'un'
            : ''
          : data.following || data.requested
          ? 'un'
          : ''
      }follow`
    }).then(res => {
      if (res.body.id === (updateData && updateData.id) || data.id) {
        setUpdateData(res.body)
        return Promise.resolve()
      } else {
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
        return <ActivityIndicator />
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
                  : data.following
                  ? 'user-check'
                  : data.requested
                  ? 'loader'
                  : 'user-plus'
              }
              color={
                updateData
                  ? updateData.following
                    ? theme.primary
                    : theme.secondary
                  : data.following
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
        <View style={styles.name}>
          {emojis?.length ? (
            <Emojis
              content={name}
              emojis={emojis}
              size={StyleConstants.Font.Size.M}
              fontBold={true}
            />
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.nameWithoutEmoji, { color: theme.primary }]}
            >
              {name}
            </Text>
          )}
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
  name: {
    flexDirection: 'row'
  },
  nameWithoutEmoji: {
    fontSize: StyleConstants.Font.Size.M,
    fontWeight: StyleConstants.Font.Weight.Bold
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
    fontSize: StyleConstants.Font.Size.S
  },
  visibility: {
    marginLeft: StyleConstants.Spacing.S
  },
  application: {
    fontSize: StyleConstants.Font.Size.S,
    marginLeft: StyleConstants.Spacing.S
  },
  relationship: {
    flexBasis: '20%',
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

export default React.memo(TimelineHeaderNotification, () => true)
