import React, { useCallback } from 'react'
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
import { useSelector } from 'react-redux'
import { getLocalAccountId } from '@root/utils/slices/instancesSlice'

export interface Props {
  item: Mastodon.Status
  queryKey: QueryKey.Timeline
  index: number
  pinnedLength?: number
  highlighted?: boolean
}

// When the poll is long
const TimelineDefault: React.FC<Props> = ({
  item,
  queryKey,
  index,
  pinnedLength,
  highlighted = false
}) => {
  const localAccountId = useSelector(getLocalAccountId)
  const isRemotePublic = queryKey[0] === 'RemotePublic'
  const navigation = useNavigation()

  let actualStatus = item.reblog ? item.reblog : item
  const contentWidth = highlighted
    ? Dimensions.get('window').width -
      StyleConstants.Spacing.Global.PagePadding * 2 // Global page padding on both sides
    : Dimensions.get('window').width -
      StyleConstants.Spacing.Global.PagePadding * 2 - // Global page padding on both sides
      StyleConstants.Avatar.M - // Avatar width
      StyleConstants.Spacing.S // Avatar margin to the right

  const onPress = useCallback(
    () =>
      !isRemotePublic &&
      !highlighted &&
      navigation.push('Screen-Shared-Toot', {
        toot: actualStatus
      }),
    []
  )
  return (
    <Pressable style={styles.statusView} onPress={onPress} disabled={true}>
      {item.reblog ? (
        <TimelineActioned action='reblog' account={item.account} />
      ) : pinnedLength && index < pinnedLength ? (
        <TimelineActioned action='pinned' account={item.account} />
      ) : null}

      <View style={styles.header}>
        <TimelineAvatar
          {...(!isRemotePublic && { queryKey })}
          account={actualStatus.account}
        />
        <TimelineHeaderDefault
          {...(!isRemotePublic && { queryKey })}
          status={actualStatus}
          sameAccount={actualStatus.account.id === localAccountId}
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
          <TimelineContent status={actualStatus} highlighted={highlighted} />
        )}
        {actualStatus.poll && (
          <TimelinePoll
            queryKey={queryKey}
            poll={actualStatus.poll}
            reblog={item.reblog ? true : false}
            sameAccount={actualStatus.account.id === localAccountId}
          />
        )}
        {actualStatus.media_attachments.length > 0 && (
          <TimelineAttachment
            status={actualStatus}
            contentWidth={contentWidth}
          />
        )}
        {actualStatus.card && <TimelineCard card={actualStatus.card} />}
      </View>

      {!isRemotePublic && (
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
    paddingBottom: StyleConstants.Spacing.M
  },
  header: {
    flex: 1,
    width: '100%',
    flexDirection: 'row'
  }
})

export default TimelineDefault
