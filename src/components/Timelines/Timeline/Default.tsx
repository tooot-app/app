import TimelineActioned from '@components/Timelines/Timeline/Shared/Actioned'
import TimelineActions from '@components/Timelines/Timeline/Shared/Actions'
import TimelineAttachment from '@components/Timelines/Timeline/Shared/Attachment'
import TimelineAvatar from '@components/Timelines/Timeline/Shared/Avatar'
import TimelineCard from '@components/Timelines/Timeline/Shared/Card'
import TimelineContent from '@components/Timelines/Timeline/Shared/Content'
import TimelineHeaderDefault from '@components/Timelines/Timeline/Shared/HeaderDefault'
import TimelinePoll from '@components/Timelines/Timeline/Shared/Poll'
import { useNavigation } from '@react-navigation/native'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getLocalAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import React, { useCallback } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

export interface Props {
  item: Mastodon.Status & { isPinned?: boolean }
  queryKey?: QueryKeyTimeline
  highlighted?: boolean
  disableDetails?: boolean
  disableOnPress?: boolean
}

// When the poll is long
const TimelineDefault: React.FC<Props> = ({
  item,
  queryKey,
  highlighted = false,
  disableDetails = false,
  disableOnPress = false
}) => {
  const localAccount = useSelector(getLocalAccount)
  const navigation = useNavigation()

  let actualStatus = item.reblog ? item.reblog : item

  const onPress = useCallback(
    () =>
      !disableOnPress &&
      !highlighted &&
      navigation.push('Screen-Shared-Toot', {
        toot: actualStatus
      }),
    []
  )

  return (
    <Pressable style={styles.statusView} onPress={onPress}>
      {item.reblog ? (
        <TimelineActioned action='reblog' account={item.account} />
      ) : item.isPinned ? (
        <TimelineActioned action='pinned' account={item.account} />
      ) : null}

      <View style={styles.header}>
        <TimelineAvatar
          queryKey={disableOnPress ? undefined : queryKey}
          account={actualStatus.account}
        />
        <TimelineHeaderDefault
          queryKey={disableOnPress ? undefined : queryKey}
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
        {actualStatus.content.length > 0 && (
          <TimelineContent
            status={actualStatus}
            highlighted={highlighted}
            disableDetails={disableDetails}
          />
        )}
        {queryKey && actualStatus.poll ? (
          <TimelinePoll
            queryKey={queryKey}
            statusId={actualStatus.id}
            poll={actualStatus.poll}
            reblog={item.reblog ? true : false}
            sameAccount={actualStatus.account.id === localAccount?.id}
          />
        ) : null}
        {!disableDetails && actualStatus.media_attachments.length > 0 && (
          <TimelineAttachment status={actualStatus} />
        )}
        {!disableDetails && actualStatus.card && (
          <TimelineCard card={actualStatus.card} />
        )}
      </View>

      {queryKey && !disableDetails && (
        <View
          style={{
            paddingLeft: highlighted
              ? 0
              : StyleConstants.Avatar.M + StyleConstants.Spacing.S
          }}
        >
          <TimelineActions
            queryKey={queryKey}
            status={actualStatus}
            reblog={item.reblog ? true : false}
          />
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  statusView: {
    padding: StyleConstants.Spacing.Global.PagePadding,
    paddingBottom: 0
  },
  header: {
    flex: 1,
    width: '100%',
    flexDirection: 'row'
  }
})

export default TimelineDefault
