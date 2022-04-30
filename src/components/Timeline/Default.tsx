import analytics from '@components/analytics'
import TimelineActioned from '@components/Timeline/Shared/Actioned'
import TimelineActions from '@components/Timeline/Shared/Actions'
import TimelineAttachment from '@components/Timeline/Shared/Attachment'
import TimelineAvatar from '@components/Timeline/Shared/Avatar'
import TimelineCard from '@components/Timeline/Shared/Card'
import TimelineContent from '@components/Timeline/Shared/Content'
import TimelineHeaderDefault from '@components/Timeline/Shared/HeaderDefault'
import TimelinePoll from '@components/Timeline/Shared/Poll'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { isEqual, uniqBy } from 'lodash'
import React, { useCallback } from 'react'
import { Pressable, View } from 'react-native'
import { useSelector } from 'react-redux'
import TimelineFeedback from './Shared/Feedback'
import TimelineFiltered, { shouldFilter } from './Shared/Filtered'
import TimelineFullConversation from './Shared/FullConversation'
import TimelineTranslate from './Shared/Translate'

export interface Props {
  item: Mastodon.Status & { _pinned?: boolean } // For account page, internal property
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  origin?: string
  highlighted?: boolean
  disableDetails?: boolean
  disableOnPress?: boolean
}

// When the poll is long
const TimelineDefault = React.memo(
  ({
    item,
    queryKey,
    rootQueryKey,
    origin,
    highlighted = false,
    disableDetails = false,
    disableOnPress = false
  }: Props) => {
    const { colors } = useTheme()
    const instanceAccount = useSelector(getInstanceAccount, () => true)
    const navigation =
      useNavigation<StackNavigationProp<TabLocalStackParamList>>()

    const actualStatus = item.reblog ? item.reblog : item

    const ownAccount = actualStatus.account?.id === instanceAccount?.id

    if (
      !highlighted &&
      queryKey &&
      shouldFilter({ status: actualStatus, queryKey })
    ) {
      return <TimelineFiltered />
    }

    const onPress = useCallback(() => {
      analytics('timeline_default_press', {
        page: queryKey ? queryKey[1].page : origin
      })
      !disableOnPress &&
        !highlighted &&
        navigation.push('Tab-Shared-Toot', {
          toot: actualStatus,
          rootQueryKey: queryKey
        })
    }, [])

    return (
      <Pressable
        accessible={highlighted ? false : true}
        style={{
          padding: StyleConstants.Spacing.Global.PagePadding,
          backgroundColor: colors.backgroundDefault,
          paddingBottom:
            disableDetails && disableOnPress
              ? StyleConstants.Spacing.Global.PagePadding
              : 0
        }}
        onPress={onPress}
      >
        {item.reblog ? (
          <TimelineActioned action='reblog' account={item.account} />
        ) : item._pinned ? (
          <TimelineActioned action='pinned' account={item.account} />
        ) : null}

        <View style={{ flex: 1, width: '100%', flexDirection: 'row' }}>
          <TimelineAvatar
            queryKey={disableOnPress ? undefined : queryKey}
            account={actualStatus.account}
            highlighted={highlighted}
          />
          <TimelineHeaderDefault
            queryKey={disableOnPress ? undefined : queryKey}
            rootQueryKey={disableOnPress ? undefined : rootQueryKey}
            status={actualStatus}
          />
        </View>

        <View
          style={{
            paddingTop: highlighted ? StyleConstants.Spacing.S : 0,
            paddingLeft: highlighted
              ? 0
              : StyleConstants.Avatar.M + StyleConstants.Spacing.S
          }}
        >
          {typeof actualStatus.content === 'string' &&
          actualStatus.content.length > 0 ? (
            <TimelineContent
              status={actualStatus}
              highlighted={highlighted}
              disableDetails={disableDetails}
            />
          ) : null}
          {queryKey && actualStatus.poll ? (
            <TimelinePoll
              queryKey={queryKey}
              rootQueryKey={rootQueryKey}
              statusId={actualStatus.id}
              poll={actualStatus.poll}
              reblog={item.reblog ? true : false}
              sameAccount={ownAccount}
            />
          ) : null}
          {!disableDetails &&
          Array.isArray(actualStatus.media_attachments) &&
          actualStatus.media_attachments.length ? (
            <TimelineAttachment status={actualStatus} />
          ) : null}
          {!disableDetails && actualStatus.card ? (
            <TimelineCard card={actualStatus.card} />
          ) : null}
          {!disableDetails ? (
            <TimelineFullConversation
              queryKey={queryKey}
              status={actualStatus}
            />
          ) : null}
          <TimelineTranslate status={actualStatus} highlighted={highlighted} />
          <TimelineFeedback status={actualStatus} highlighted={highlighted} />
        </View>

        {queryKey && !disableDetails ? (
          <TimelineActions
            queryKey={queryKey}
            rootQueryKey={rootQueryKey}
            highlighted={highlighted}
            status={actualStatus}
            accts={uniqBy(
              (
                [actualStatus.account] as Mastodon.Account[] &
                  Mastodon.Mention[]
              )
                .concat(actualStatus.mentions)
                .filter(d => d?.id !== instanceAccount?.id),
              d => d?.id
            ).map(d => d?.acct)}
            reblog={item.reblog ? true : false}
          />
        ) : null}
      </Pressable>
    )
  },
  (prev, next) => isEqual(prev.item, next.item)
)

export default TimelineDefault
