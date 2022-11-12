import analytics from '@components/analytics'
import TimelineActioned from '@components/Timeline/Shared/Actioned'
import TimelineActions from '@components/Timeline/Shared/Actions'
import TimelineAttachment from '@components/Timeline/Shared/Attachment'
import TimelineAvatar from '@components/Timeline/Shared/Avatar'
import TimelineCard from '@components/Timeline/Shared/Card'
import TimelineContent from '@components/Timeline/Shared/Content'
// @ts-ignore
import TimelineHeaderDefault from '@components/Timeline/Shared/HeaderDefault'
import TimelinePoll from '@components/Timeline/Shared/Poll'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { uniqBy } from 'lodash'
import React, { useRef } from 'react'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import { useSelector } from 'react-redux'
import TimelineContextMenu from './Shared/ContextMenu'
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
const TimelineDefault: React.FC<Props> = ({
  item,
  queryKey,
  rootQueryKey,
  origin,
  highlighted = false,
  disableDetails = false,
  disableOnPress = false
}) => {
  if (highlighted) {
    disableOnPress = true
  }

  const { colors } = useTheme()
  const instanceAccount = useSelector(getInstanceAccount, () => true)
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  const actualStatus = item.reblog ? item.reblog : item

  const ownAccount = actualStatus.account?.id === instanceAccount?.id

  const copiableContent = useRef<{ content: string; complete: boolean }>({
    content: '',
    complete: false
  })

  const filtered = queryKey && shouldFilter({ copiableContent, status: actualStatus, queryKey })
  if (queryKey && filtered && !highlighted) {
    return <TimelineFiltered phrase={filtered} />
  }

  const onPress = () => {
    analytics('timeline_default_press', {
      page: queryKey ? queryKey[1].page : origin
    })
    navigation.push('Tab-Shared-Toot', {
      toot: actualStatus,
      rootQueryKey: queryKey
    })
  }

  const mainStyle: StyleProp<ViewStyle> = {
    padding: StyleConstants.Spacing.Global.PagePadding,
    backgroundColor: colors.backgroundDefault,
    paddingBottom: disableDetails ? StyleConstants.Spacing.Global.PagePadding : 0
  }
  const main = () => (
    <>
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
          status={actualStatus}
          highlighted={highlighted}
        />
      </View>

      <View
        style={{
          paddingTop: highlighted ? StyleConstants.Spacing.S : 0,
          paddingLeft: highlighted ? 0 : StyleConstants.Avatar.M + StyleConstants.Spacing.S
        }}
      >
        {typeof actualStatus.content === 'string' && actualStatus.content.length > 0 ? (
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
        {!disableDetails && actualStatus.card ? <TimelineCard card={actualStatus.card} /> : null}
        {!disableDetails ? (
          <TimelineFullConversation queryKey={queryKey} status={actualStatus} />
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
          ownAccount={ownAccount}
          accts={uniqBy(
            ([actualStatus.account] as Mastodon.Account[] & Mastodon.Mention[])
              .concat(actualStatus.mentions)
              .filter(d => d?.id !== instanceAccount?.id),
            d => d?.id
          ).map(d => d?.acct)}
          reblog={item.reblog ? true : false}
        />
      ) : null}
    </>
  )

  return disableOnPress ? (
    <View style={mainStyle}>{main()}</View>
  ) : (
    <TimelineContextMenu
      copiableContent={copiableContent}
      status={actualStatus}
      queryKey={queryKey}
      rootQueryKey={rootQueryKey}
    >
      <Pressable
        accessible={highlighted ? false : true}
        style={mainStyle}
        onPress={onPress}
        onLongPress={() => {}}
      >
        {main()}
      </Pressable>
    </TimelineContextMenu>
  )
}

export default TimelineDefault
