import React, { useCallback, useMemo } from 'react'
import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import TimelineActioned from './Shared/Actioned'
import TimelineActions from './Shared/Actions'
import TimelineAttachment from './Shared/Attachment'
import TimelineAvatar from './Shared/Avatar'
import TimelineCard from './Shared/Card'
import TimelineContent from './Shared/Content'
import TimelineHeaderDefault from './Shared/HeaderDefault'
import TimelinePoll from './Shared/Poll'

import { StyleConstants } from 'src/utils/styles/constants'

export interface Props {
  item: Mastodon.Status
  queryKey: App.QueryKey
}

// When the poll is long
const TimelineDefault: React.FC<Props> = ({ item, queryKey }) => {
  const navigation = useNavigation()

  let actualStatus = item.reblog ? item.reblog : item
  const contentWidth =
    Dimensions.get('window').width -
    StyleConstants.Spacing.Global.PagePadding * 2 - // Global page padding on both sides
    StyleConstants.Avatar.S - // Avatar width
    StyleConstants.Spacing.S // Avatar margin to the right

  const pressableToot = useCallback(
    () =>
      navigation.navigate('Screen-Shared-Toot', {
        toot: actualStatus
      }),
    []
  )
  const childrenToot = useMemo(
    () => (
      <>
        {actualStatus.content.length > 0 && (
          <TimelineContent status={actualStatus} />
        )}
        {actualStatus.poll && (
          <TimelinePoll queryKey={queryKey} status={actualStatus} />
        )}
        {actualStatus.media_attachments.length > 0 && (
          <TimelineAttachment status={actualStatus} width={contentWidth} />
        )}
        {actualStatus.card && <TimelineCard card={actualStatus.card} />}
      </>
    ),
    [actualStatus.poll?.voted]
  )

  return (
    <View style={styles.statusView}>
      {item.reblog && (
        <TimelineActioned action='reblog' account={item.account} />
      )}
      <View style={styles.status}>
        <TimelineAvatar account={actualStatus.account} />
        <View style={styles.details}>
          <TimelineHeaderDefault queryKey={queryKey} status={actualStatus} />
          {/* Can pass toot info to next page to speed up performance */}
          <Pressable onPress={pressableToot} children={childrenToot} />
          <TimelineActions queryKey={queryKey} status={actualStatus} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  statusView: {
    flex: 1,
    flexDirection: 'column',
    padding: StyleConstants.Spacing.Global.PagePadding,
    paddingBottom: StyleConstants.Spacing.M
  },
  status: {
    flex: 1,
    flexDirection: 'row'
  },
  details: {
    flex: 1
  }
})

export default React.memo(TimelineDefault, (prev, next) => {
  let skipUpdate = true
  skipUpdate =
    prev.item.id === next.item.id &&
    prev.item.replies_count === next.item.replies_count &&
    prev.item.favourited === next.item.favourited &&
    prev.item.reblogged === next.item.reblogged &&
    prev.item.bookmarked === next.item.bookmarked &&
    prev.item.poll?.voted === next.item.poll?.voted &&
    prev.item.reblog?.poll?.voted === next.item.reblog?.poll?.voted

  return skipUpdate
})
