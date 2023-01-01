import Icon from '@components/Icon'
import { displayMessage } from '@components/Message'
import CustomText from '@components/Text'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useQueryClient } from '@tanstack/react-query'
import { androidActionSheetStyles } from '@utils/helpers/androidActionSheetStyles'
import { RootStackParamList } from '@utils/navigation/navigators'
import {
  MutationVarsTimelineUpdateStatusProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { useAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { uniqBy } from 'lodash'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import StatusContext from './Context'

const TimelineActions: React.FC = () => {
  const { queryKey, rootQueryKey, status, reblogStatus, ownAccount, highlighted, disableDetails } =
    useContext(StatusContext)
  if (!queryKey || !status || disableDetails) return null

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { t } = useTranslation(['common', 'componentTimeline'])
  const { colors, theme } = useTheme()
  const iconColor = colors.secondary

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    onMutate: true,
    onSuccess: (_, params) => {
      const theParams = params as MutationVarsTimelineUpdateStatusProperty
      if (
        // Un-bookmark from bookmarks page
        (queryKey[1].page === 'Bookmarks' && theParams.payload.property === 'bookmarked') ||
        // Un-favourite from favourites page
        (queryKey[1].page === 'Favourites' && theParams.payload.property === 'favourited')
      ) {
        queryClient.invalidateQueries(queryKey)
      } else if (theParams.payload.property === 'favourited') {
        // When favourited, update favourited page
        const tempQueryKey: QueryKeyTimeline = ['Timeline', { page: 'Favourites' }]
        queryClient.invalidateQueries(tempQueryKey)
      } else if (theParams.payload.property === 'bookmarked') {
        // When bookmarked, update bookmark page
        const tempQueryKey: QueryKeyTimeline = ['Timeline', { page: 'Bookmarks' }]
        queryClient.invalidateQueries(tempQueryKey)
      }
    },
    onError: (err: any, params) => {
      const correctParam = params as MutationVarsTimelineUpdateStatusProperty
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          function: t(
            `componentTimeline:shared.actions.${correctParam.payload.property}.function` as any
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

  const [accountId] = useAccountStorage.string('auth.account.id')
  const onPressReply = () => {
    const accts = uniqBy(
      ([status.account] as Mastodon.Account[] & Mastodon.Mention[])
        .concat(status.mentions)
        .filter(d => d?.id !== accountId),
      d => d?.id
    ).map(d => d?.acct)
    navigation.navigate('Screen-Compose', {
      type: 'reply',
      incomingStatus: status,
      accts,
      queryKey
    })
  }
  const { showActionSheetWithOptions } = useActionSheet()
  const onPressReblog = () => {
    if (!status.reblogged) {
      showActionSheetWithOptions(
        {
          title: t('componentTimeline:shared.actions.reblogged.options.title'),
          options: [
            t('componentTimeline:shared.actions.reblogged.options.public'),
            t('componentTimeline:shared.actions.reblogged.options.unlisted'),
            t('common:buttons.cancel')
          ],
          cancelButtonIndex: 2,
          ...androidActionSheetStyles(colors)
        },
        (selectedIndex: number) => {
          switch (selectedIndex) {
            case 0:
              mutation.mutate({
                type: 'updateStatusProperty',
                queryKey,
                rootQueryKey,
                id: status.id,
                isReblog: !!reblogStatus,
                fetchRemoteURI: status._remote ? status.uri : undefined,
                payload: {
                  property: 'reblogged',
                  currentValue: status.reblogged,
                  propertyCount: 'reblogs_count',
                  countValue: status.reblogs_count,
                  visibility: 'public'
                }
              })
              break
            case 1:
              mutation.mutate({
                type: 'updateStatusProperty',
                queryKey,
                rootQueryKey,
                id: status.id,
                isReblog: !!reblogStatus,
                fetchRemoteURI: status._remote ? status.uri : undefined,
                payload: {
                  property: 'reblogged',
                  currentValue: status.reblogged,
                  propertyCount: 'reblogs_count',
                  countValue: status.reblogs_count,
                  visibility: 'unlisted'
                }
              })
              break
          }
        }
      )
    } else {
      mutation.mutate({
        type: 'updateStatusProperty',
        queryKey,
        rootQueryKey,
        id: status.id,
        isReblog: !!reblogStatus,
        fetchRemoteURI: status._remote ? status.uri : undefined,
        payload: {
          property: 'reblogged',
          currentValue: status.reblogged,
          propertyCount: 'reblogs_count',
          countValue: status.reblogs_count,
          visibility: 'public'
        }
      })
    }
  }
  const onPressFavourite = () => {
    mutation.mutate({
      type: 'updateStatusProperty',
      queryKey,
      rootQueryKey,
      id: status.id,
      isReblog: !!reblogStatus,
      fetchRemoteURI: status._remote ? status.uri : undefined,
      payload: {
        property: 'favourited',
        currentValue: status.favourited,
        propertyCount: 'favourites_count',
        countValue: status.favourites_count
      }
    })
  }
  const onPressBookmark = () => {
    mutation.mutate({
      type: 'updateStatusProperty',
      queryKey,
      rootQueryKey,
      id: status.id,
      isReblog: !!reblogStatus,
      fetchRemoteURI: status._remote ? status.uri : undefined,
      payload: {
        property: 'bookmarked',
        currentValue: status.bookmarked,
        propertyCount: undefined,
        countValue: undefined
      }
    })
  }

  const childrenReply = () => (
    <>
      <Icon name='MessageCircle' color={iconColor} size={StyleConstants.Font.Size.L} />
      {status.replies_count > 0 ? (
        <CustomText
          style={{
            color: colors.secondary,
            fontSize: StyleConstants.Font.Size.M,
            marginLeft: StyleConstants.Spacing.XS
          }}
        >
          {status.replies_count}
        </CustomText>
      ) : null}
    </>
  )
  const childrenReblog = () => {
    const color = (state: boolean) => (state ? colors.green : colors.secondary)
    const disabled =
      status.visibility === 'direct' || (status.visibility === 'private' && !ownAccount)
    return (
      <>
        <Icon
          name='Repeat'
          color={disabled ? colors.disabled : color(status.reblogged)}
          crossOut={disabled}
          size={StyleConstants.Font.Size.L}
        />
        {status.reblogs_count > 0 ? (
          <CustomText
            style={{
              color:
                status.visibility === 'private' && !ownAccount
                  ? colors.disabled
                  : color(status.reblogged),
              fontSize: StyleConstants.Font.Size.M,
              marginLeft: StyleConstants.Spacing.XS
            }}
          >
            {status.reblogs_count}
          </CustomText>
        ) : null}
      </>
    )
  }
  const childrenFavourite = () => {
    const color = (state: boolean) => (state ? colors.red : colors.secondary)
    return (
      <>
        <Icon name='Heart' color={color(status.favourited)} size={StyleConstants.Font.Size.L} />
        {status.favourites_count > 0 ? (
          <CustomText
            style={{
              color: color(status.favourited),
              fontSize: StyleConstants.Font.Size.M,
              marginLeft: StyleConstants.Spacing.XS,
              marginTop: 0
            }}
          >
            {status.favourites_count}
          </CustomText>
        ) : null}
      </>
    )
  }
  const childrenBookmark = () => {
    const color = (state: boolean) => (state ? colors.yellow : colors.secondary)
    return (
      <Icon name='Bookmark' color={color(status.bookmarked)} size={StyleConstants.Font.Size.L} />
    )
  }

  return (
    <View style={{ flexDirection: 'row' }}>
      <Pressable
        {...(highlighted
          ? {
              accessibilityLabel: t('componentTimeline:shared.actions.reply.accessibilityLabel'),
              accessibilityRole: 'button'
            }
          : { accessibilityLabel: '' })}
        style={styles.action}
        onPress={onPressReply}
        children={childrenReply()}
      />

      <Pressable
        {...(highlighted
          ? {
              accessibilityLabel: t(
                'componentTimeline:shared.actions.reblogged.accessibilityLabel'
              ),
              accessibilityRole: 'button'
            }
          : { accessibilityLabel: '' })}
        style={styles.action}
        onPress={onPressReblog}
        children={childrenReblog()}
        disabled={
          status.visibility === 'direct' || (status.visibility === 'private' && !ownAccount)
        }
      />

      <Pressable
        {...(highlighted
          ? {
              accessibilityLabel: t(
                'componentTimeline:shared.actions.favourited.accessibilityLabel'
              ),
              accessibilityRole: 'button'
            }
          : { accessibilityLabel: '' })}
        style={styles.action}
        onPress={onPressFavourite}
        children={childrenFavourite()}
      />

      <Pressable
        {...(highlighted
          ? {
              accessibilityLabel: t(
                'componentTimeline:shared.actions.bookmarked.accessibilityLabel'
              ),
              accessibilityRole: 'button'
            }
          : { accessibilityLabel: '' })}
        style={styles.action}
        onPress={onPressBookmark}
        children={childrenBookmark()}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: StyleConstants.Spacing.S * 1.5
  }
})

export default TimelineActions
