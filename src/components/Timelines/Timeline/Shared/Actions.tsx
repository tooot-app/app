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
import { ActionSheetIOS, Pressable, StyleSheet, Text, View } from 'react-native'
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
        incomingStatus: status
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
  const onPressShare = useCallback(
    () =>
      ActionSheetIOS.showShareActionSheetWithOptions(
        {
          url: status.uri,
          excludedActivityTypes: [
            'com.apple.UIKit.activity.Mail',
            'com.apple.UIKit.activity.Print',
            'com.apple.UIKit.activity.SaveToCameraRoll',
            'com.apple.UIKit.activity.OpenInIBooks'
          ]
        },
        () => haptics('Error'),
        () => haptics('Success')
      ),
    []
  )

  const childrenReply = useMemo(
    () => (
      <>
        <Icon
          name='MessageCircle'
          color={iconColor}
          size={StyleConstants.Font.Size.M + 2}
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
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    [status.reblogged]
  )
  const childrenFavourite = useMemo(
    () => (
      <Icon
        name='Heart'
        color={iconColorAction(status.favourited)}
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    [status.favourited]
  )
  const childrenBookmark = useMemo(
    () => (
      <Icon
        name='Bookmark'
        color={iconColorAction(status.bookmarked)}
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    [status.bookmarked]
  )
  const childrenShare = useMemo(
    () => (
      <Icon
        name='Share2'
        color={iconColor}
        size={StyleConstants.Font.Size.M + 2}
      />
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
    paddingVertical: StyleConstants.Spacing.S
  }
})

export default TimelineActions
