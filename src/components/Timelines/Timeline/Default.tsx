import React, { useCallback, useMemo } from 'react'
import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import TimelineActioned from '@components/Timelines/Timeline/Shared/Actioned'
import TimelineActions from '@components/Timelines/Timeline/Shared/Actions'
import TimelineAttachment from '@components/Timelines/Timeline/Shared/Attachment'
import TimelineAvatar from '@components/Timelines/Timeline/Shared/Avatar'
import TimelineCard from '@components/Timelines/Timeline/Shared/Card'
import TimelineContent from '@components/Timelines/Timeline/Shared/Content'
import TimelineHeaderDefault from '@components/Timelines/Timeline/Shared/HeaderDefault'
import TimelinePoll from '@components/Timelines/Timeline/Shared/Poll'

import { StyleConstants } from '@utils/styles/constants'

export interface Props {
  item: Mastodon.Status
  queryKey: App.QueryKey
  highlighted?: boolean
}

// When the poll is long
const TimelineDefault: React.FC<Props> = ({
  item,
  queryKey,
  highlighted = false
}) => {
  const navigation = useNavigation()

  let actualStatus = item.reblog ? item.reblog : item
  const contentWidth = highlighted
    ? Dimensions.get('window').width -
      StyleConstants.Spacing.Global.PagePadding * 2 // Global page padding on both sides
    : Dimensions.get('window').width -
      StyleConstants.Spacing.Global.PagePadding * 2 - // Global page padding on both sides
      StyleConstants.Avatar.S - // Avatar width
      StyleConstants.Spacing.S // Avatar margin to the right

  const tootOnPress = useCallback(
    () =>
      navigation.navigate('Screen-Shared-Toot', {
        toot: actualStatus
      }),
    []
  )
  const tootChildren = useMemo(
    () => (
      <View
        style={{
          paddingTop: highlighted ? StyleConstants.Spacing.S : 0,
          paddingLeft: highlighted
            ? 0
            : StyleConstants.Avatar.S + StyleConstants.Spacing.S
        }}
      >
        {actualStatus.content.length > 0 && (
          <TimelineContent status={actualStatus} highlighted={highlighted} />
        )}
        {actualStatus.poll && (
          <TimelinePoll queryKey={queryKey} status={actualStatus} />
        )}
        {actualStatus.media_attachments.length > 0 && (
          <TimelineAttachment status={actualStatus} width={contentWidth} />
        )}
        {actualStatus.card && <TimelineCard card={actualStatus.card} />}
      </View>
    ),
    [actualStatus.poll?.voted]
  )

  return (
    <View style={styles.statusView}>
      {item.reblog && (
        <TimelineActioned action='reblog' account={item.account} />
      )}

      <View style={styles.header}>
        <TimelineAvatar account={actualStatus.account} />
        <TimelineHeaderDefault queryKey={queryKey} status={actualStatus} />
      </View>
      
      <Pressable onPress={tootOnPress} children={tootChildren} />
      <View
        style={{
          paddingLeft: highlighted
            ? 0
            : StyleConstants.Avatar.S + StyleConstants.Spacing.S
        }}
      >
        <TimelineActions queryKey={queryKey} status={actualStatus} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  statusView: {
    padding: StyleConstants.Spacing.Global.PagePadding,
    paddingBottom: StyleConstants.Spacing.M
  },
  header: {
    flex: 1,
    width: '100%',
    flexDirection: 'row'
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
