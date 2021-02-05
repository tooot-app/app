import analytics from '@components/analytics'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { toast } from '@components/toast'
import { useNavigation } from '@react-navigation/native'
import {
  MutationVarsTimelineUpdateStatusProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useQueryClient } from 'react-query'

export interface Props {
  queryKey: QueryKeyTimeline
  status: Mastodon.Status
  accts: Mastodon.Account['acct'][] // When replying to conversations
  reblog: boolean
}

const TimelineActions: React.FC<Props> = ({
  queryKey,
  status,
  accts,
  reblog
}) => {
  const navigation = useNavigation()
  const { t } = useTranslation('componentTimeline')
  const { theme } = useTheme()
  const iconColor = theme.secondary
  const iconColorAction = (state: boolean) =>
    state ? theme.primary : theme.secondary

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    queryClient,
    onMutate: true,
    onSuccess: (_, params) => {
      const theParams = params as MutationVarsTimelineUpdateStatusProperty
      if (
        // Un-bookmark from bookmarks page
        (queryKey[1].page === 'Bookmarks' &&
          theParams.payload.property === 'bookmarked') ||
        // Un-favourite from favourites page
        (queryKey[1].page === 'Favourites' &&
          theParams.payload.property === 'favourited') ||
        // Un-reblog from following page
        (queryKey[1].page === 'Following' &&
          theParams.payload.property === 'reblogged' &&
          theParams.payload.currentValue === true)
      ) {
        queryClient.invalidateQueries(queryKey)
      } else if (theParams.payload.property === 'reblogged') {
        // When reblogged, update cache of following page
        const tempQueryKey: QueryKeyTimeline = [
          'Timeline',
          { page: 'Following' }
        ]
        queryClient.invalidateQueries(tempQueryKey)
      } else if (theParams.payload.property === 'favourited') {
        // When favourited, update favourited page
        const tempQueryKey: QueryKeyTimeline = [
          'Timeline',
          { page: 'Favourites' }
        ]
        queryClient.invalidateQueries(tempQueryKey)
      } else if (theParams.payload.property === 'bookmarked') {
        // When bookmarked, update bookmark page
        const tempQueryKey: QueryKeyTimeline = [
          'Timeline',
          { page: 'Bookmarks' }
        ]
        queryClient.invalidateQueries(tempQueryKey)
      }
    },
    onError: (err: any, params, oldData) => {
      const correctParam = params as MutationVarsTimelineUpdateStatusProperty
      haptics('Error')
      toast({
        type: 'error',
        message: t('common:toastMessage.error.message', {
          function: t(
            `shared.actions.${correctParam.payload.property}.function`
          )
        }),
        ...(err.status &&
          typeof err.status === 'number' &&
          err.data &&
          err.data.error &&
          typeof err.data.error === 'string' && {
            description: err.data.error
          })
      })
      queryClient.invalidateQueries(queryKey)
    }
  })

  const onPressReply = useCallback(() => {
    analytics('timeline_shared_actions_reply_press', {
      page: queryKey[1].page,
      count: status.replies_count
    })
    navigation.navigate('Screen-Compose', {
      type: 'reply',
      incomingStatus: status,
      accts,
      queryKey
    })
  }, [status.replies_count])
  const onPressReblog = useCallback(() => {
    analytics('timeline_shared_actions_reblog_press', {
      page: queryKey[1].page,
      count: status.reblogs_count,
      current: status.reblogged
    })
    mutation.mutate({
      type: 'updateStatusProperty',
      queryKey,
      id: status.id,
      reblog,
      payload: {
        property: 'reblogged',
        currentValue: status.reblogged,
        propertyCount: 'reblogs_count',
        countValue: status.reblogs_count
      }
    })
  }, [status.reblogged, status.reblogs_count])
  const onPressFavourite = useCallback(() => {
    analytics('timeline_shared_actions_favourite_press', {
      page: queryKey[1].page,
      count: status.favourites_count,
      current: status.favourited
    })
    mutation.mutate({
      type: 'updateStatusProperty',
      queryKey,
      id: status.id,
      reblog,
      payload: {
        property: 'favourited',
        currentValue: status.favourited,
        propertyCount: 'favourites_count',
        countValue: status.favourites_count
      }
    })
  }, [status.favourited, status.favourites_count])
  const onPressBookmark = useCallback(() => {
    analytics('timeline_shared_actions_bookmark_press', {
      page: queryKey[1].page,
      current: status.bookmarked
    })
    mutation.mutate({
      type: 'updateStatusProperty',
      queryKey,
      id: status.id,
      reblog,
      payload: {
        property: 'bookmarked',
        currentValue: status.bookmarked,
        propertyCount: undefined,
        countValue: undefined
      }
    })
  }, [status.bookmarked])

  const childrenReply = useMemo(
    () => (
      <>
        <Icon
          name='MessageCircle'
          color={iconColor}
          size={StyleConstants.Font.Size.L}
        />
        {status.replies_count > 0 && (
          <Text
            style={{
              color: theme.secondary,
              fontSize: StyleConstants.Font.Size.M,
              marginLeft: StyleConstants.Spacing.XS
            }}
          >
            {status.replies_count}
          </Text>
        )}
      </>
    ),
    [status.replies_count]
  )
  const childrenReblog = useMemo(
    () => (
      <>
        <Icon
          name='Repeat'
          color={
            status.visibility === 'private' || status.visibility === 'direct'
              ? theme.disabled
              : iconColorAction(status.reblogged)
          }
          size={StyleConstants.Font.Size.L}
          strokeWidth={status.reblogged ? 3 : undefined}
        />
        {status.reblogs_count > 0 && (
          <Text
            style={{
              color: iconColorAction(status.reblogged),
              fontSize: StyleConstants.Font.Size.M,
              marginLeft: StyleConstants.Spacing.XS
            }}
          >
            {status.reblogs_count}
          </Text>
        )}
      </>
    ),
    [status.reblogged, status.reblogs_count]
  )
  const childrenFavourite = useMemo(
    () => (
      <>
        <Icon
          name='Heart'
          color={iconColorAction(status.favourited)}
          size={StyleConstants.Font.Size.L}
          strokeWidth={status.favourited ? 3 : undefined}
        />
        {status.favourites_count > 0 && (
          <Text
            style={{
              color: iconColorAction(status.favourited),
              fontSize: StyleConstants.Font.Size.M,
              marginLeft: StyleConstants.Spacing.XS,
              marginTop: 0
            }}
          >
            {status.favourites_count}
          </Text>
        )}
      </>
    ),
    [status.favourited, status.favourites_count]
  )
  const childrenBookmark = useMemo(
    () => (
      <Icon
        name='Bookmark'
        color={iconColorAction(status.bookmarked)}
        size={StyleConstants.Font.Size.L}
        strokeWidth={status.bookmarked ? 3 : undefined}
      />
    ),
    [status.bookmarked]
  )

  return (
    <>
      <View style={styles.actions}>
        <Pressable
          style={styles.action}
          onPress={onPressReply}
          children={childrenReply}
        />

        <Pressable
          style={styles.action}
          onPress={onPressReblog}
          children={childrenReblog}
          disabled={
            status.visibility === 'private' || status.visibility === 'direct'
          }
        />

        <Pressable
          style={styles.action}
          onPress={onPressFavourite}
          children={childrenFavourite}
        />

        <Pressable
          style={styles.action}
          onPress={onPressBookmark}
          children={childrenBookmark}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row'
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: StyleConstants.Font.Size.L + StyleConstants.Spacing.S * 4
  }
})

export default TimelineActions
