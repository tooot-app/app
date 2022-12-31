import menuInstance from '@components/contextMenu/instance'
import menuShare from '@components/contextMenu/share'
import menuStatus from '@components/contextMenu/status'
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
import { featureCheck } from '@utils/helpers/featureCheck'
import removeHTML from '@utils/helpers/removeHTML'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { usePreferencesQuery } from '@utils/queryHooks/preferences'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Fragment, useRef, useState } from 'react'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import * as ContextMenu from 'zeego/context-menu'
import StatusContext from './Shared/Context'
import TimelineFeedback from './Shared/Feedback'
import TimelineFiltered, { FilteredProps, shouldFilter } from './Shared/Filtered'
import TimelineFullConversation from './Shared/FullConversation'
import TimelineHeaderAndroid from './Shared/HeaderAndroid'
import TimelineTranslate from './Shared/Translate'

export interface Props {
  item: Mastodon.Status & { _pinned?: boolean } // For account page, internal property
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  highlighted?: boolean
  disableDetails?: boolean
  disableOnPress?: boolean
  isConversation?: boolean
}

// When the poll is long
const TimelineDefault: React.FC<Props> = ({
  item,
  queryKey,
  rootQueryKey,
  highlighted = false,
  disableDetails = false,
  disableOnPress = false,
  isConversation = false
}) => {
  const status = item.reblog ? item.reblog : item
  const rawContent = useRef<string[]>([])
  if (highlighted || isConversation) {
    rawContent.current = [
      removeHTML(status.content),
      status.spoiler_text ? removeHTML(status.spoiler_text) : ''
    ].filter(c => c.length)
  }

  const { colors } = useTheme()
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  const [accountId] = useAccountStorage.string('auth.account.id')
  const { data: preferences } = usePreferencesQuery()

  const ownAccount = status.account?.id === accountId
  const [spoilerExpanded, setSpoilerExpanded] = useState(
    preferences?.['reading:expand:spoilers'] || false
  )
  const spoilerHidden = status.spoiler_text?.length
    ? !preferences?.['reading:expand:spoilers'] && !spoilerExpanded
    : false
  const detectedLanguage = useRef<string>(status.language || '')
  const excludeMentions = useRef<Mastodon.Mention[]>([])

  const mainStyle: StyleProp<ViewStyle> = {
    flex: 1,
    padding: disableDetails
      ? StyleConstants.Spacing.Global.PagePadding / 1.5
      : StyleConstants.Spacing.Global.PagePadding,
    backgroundColor: colors.backgroundDefault,
    paddingBottom: disableDetails ? StyleConstants.Spacing.Global.PagePadding / 1.5 : 0
  }
  const main = () => (
    <>
      {item.reblog ? (
        <TimelineActioned action='reblog' />
      ) : item._pinned ? (
        <TimelineActioned action='pinned' />
      ) : null}

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          ...(disableDetails && { alignItems: 'flex-start', overflow: 'hidden' })
        }}
      >
        <TimelineAvatar />
        <TimelineHeaderDefault />
      </View>

      <View
        style={{
          paddingTop: highlighted ? StyleConstants.Spacing.S : 0,
          paddingLeft: highlighted
            ? 0
            : (disableDetails || isConversation
                ? StyleConstants.Avatar.XS
                : StyleConstants.Avatar.M) + StyleConstants.Spacing.S,
          ...(disableDetails && { marginTop: -StyleConstants.Spacing.S })
        }}
      >
        <TimelineContent setSpoilerExpanded={setSpoilerExpanded} />
        <TimelinePoll />
        <TimelineAttachment />
        <TimelineCard />
        <TimelineFullConversation />
        <TimelineTranslate />
        <TimelineFeedback />

        <TimelineActions />
      </View>
    </>
  )

  const mShare = menuShare({
    visibility: status.visibility,
    type: 'status',
    url: status.url || status.uri,
    rawContent
  })
  const mStatus = menuStatus({ status, queryKey, rootQueryKey })
  const mInstance = menuInstance({ status, queryKey, rootQueryKey })

  if (!ownAccount) {
    let filterResults: FilteredProps['filterResults'] = []
    const [filterRevealed, setFilterRevealed] = useState(false)
    const hasFilterServerSide = featureCheck('filter_server_side')
    if (hasFilterServerSide) {
      if (status.filtered?.length) {
        filterResults = status.filtered?.map(filter => filter.filter)
      }
    } else {
      if (queryKey) {
        const checkFilter = shouldFilter({ queryKey, status })
        if (checkFilter?.length) {
          filterResults = checkFilter
        }
      }
    }
    if (queryKey && !highlighted && filterResults?.length && !filterRevealed) {
      return !filterResults.filter(result => result.filter_action === 'hide').length ? (
        <Pressable onPress={() => setFilterRevealed(!filterRevealed)}>
          <TimelineFiltered filterResults={filterResults} />
        </Pressable>
      ) : null
    }
  }

  return (
    <StatusContext.Provider
      value={{
        queryKey,
        rootQueryKey,
        status,
        reblogStatus: item.reblog ? item : undefined,
        ownAccount,
        spoilerHidden,
        rawContent,
        detectedLanguage,
        excludeMentions,
        highlighted,
        inThread: queryKey?.[1].page === 'Toot',
        disableDetails,
        disableOnPress,
        isConversation
      }}
    >
      {disableOnPress ? (
        <View style={mainStyle}>{main()}</View>
      ) : (
        <>
          <ContextMenu.Root>
            <ContextMenu.Trigger>
              <Pressable
                accessible={highlighted ? false : true}
                style={mainStyle}
                disabled={highlighted}
                onPress={() =>
                  navigation.push('Tab-Shared-Toot', {
                    toot: status,
                    rootQueryKey: queryKey
                  })
                }
                onLongPress={() => {}}
                children={main()}
              />
            </ContextMenu.Trigger>

            <ContextMenu.Content>
              {[mShare, mStatus, mInstance].map((type, i) => (
                <Fragment key={i}>
                  {type.map((mGroup, index) => (
                    <ContextMenu.Group key={index}>
                      {mGroup.map(menu => (
                        <ContextMenu.Item key={menu.key} {...menu.item}>
                          <ContextMenu.ItemTitle children={menu.title} />
                          <ContextMenu.ItemIcon ios={{ name: menu.icon }} />
                        </ContextMenu.Item>
                      ))}
                    </ContextMenu.Group>
                  ))}
                </Fragment>
              ))}
            </ContextMenu.Content>
          </ContextMenu.Root>
          <TimelineHeaderAndroid />
        </>
      )}
    </StatusContext.Provider>
  )
}

export default React.memo(TimelineDefault, () => true)
