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
import {
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { useQueryClient } from 'react-query'

export interface Props {
  queryKey: QueryKeyTimeline
  status: Mastodon.Status
  reblog: boolean
}

const TimelineActions: React.FC<Props> = ({ queryKey, status, reblog }) => {
  const navigation = useNavigation()
  const { t } = useTranslation()
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
            `timeline:shared.actions.${correctParam.payload.property}.function`
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
      queryClient.setQueryData(queryKey, oldData)
    }
  })

  const onPressReply = useCallback(
    () =>
      navigation.navigate('Screen-Shared-Compose', {
        type: 'reply',
        incomingStatus: status,
        queryKey
      }),
    []
  )
  const onPressReblog = useCallback(
    () =>
      mutation.mutate({
        type: 'updateStatusProperty',
        queryKey,
        id: status.id,
        reblog,
        payload: {
          property: 'reblogged',
          currentValue: status.reblogged
        }
      }),
    [status.reblogged]
  )
  const onPressFavourite = useCallback(
    () =>
      mutation.mutate({
        type: 'updateStatusProperty',
        queryKey,
        id: status.id,
        reblog,
        payload: {
          property: 'favourited',
          currentValue: status.favourited
        }
      }),
    [status.favourited]
  )
  const onPressBookmark = useCallback(
    () =>
      mutation.mutate({
        type: 'updateStatusProperty',
        queryKey,
        id: status.id,
        reblog,
        payload: {
          property: 'bookmarked',
          currentValue: status.bookmarked
        }
      }),
    [status.bookmarked]
  )
  const onPressShare = useCallback(() => {
    switch (Platform.OS) {
      case 'ios':
        return Share.share({
          url: status.uri
        })
      case 'android':
        return Share.share({
          message: status.uri
        })
    }
  }, [])

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
              ...StyleConstants.FontStyle.M,
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
      <Icon
        name='Repeat'
        color={
          status.visibility === 'private' || status.visibility === 'direct'
            ? theme.disabled
            : iconColorAction(status.reblogged)
        }
        size={StyleConstants.Font.Size.L}
      />
    ),
    [status.reblogged]
  )
  const childrenFavourite = useMemo(
    () => (
      <Icon
        name='Heart'
        color={iconColorAction(status.favourited)}
        size={StyleConstants.Font.Size.L}
      />
    ),
    [status.favourited]
  )
  const childrenBookmark = useMemo(
    () => (
      <Icon
        name='Bookmark'
        color={iconColorAction(status.bookmarked)}
        size={StyleConstants.Font.Size.L}
      />
    ),
    [status.bookmarked]
  )
  const childrenShare = useMemo(
    () => (
      <Icon name='Share2' color={iconColor} size={StyleConstants.Font.Size.L} />
    ),
    []
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

        <Pressable
          style={styles.action}
          onPress={onPressShare}
          children={childrenShare}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  actions: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    marginTop: StyleConstants.Spacing.S
  },
  action: {
    width: '20%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: StyleConstants.Spacing.S
  }
})

export default TimelineActions
