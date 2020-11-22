import React, { useMemo } from 'react'
import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import Actioned from './Shared/Actioned'
import Avatar from './Shared/Avatar'
import HeaderDefault from './Shared/HeaderDefault'
import Content from './Shared/Content'
import Poll from './Shared/Poll'
import Attachment from './Shared/Attachment'
import Card from './Shared/Card'
import ActionsStatus from './Shared/ActionsStatus'

import constants from 'src/utils/styles/constants'

export interface Props {
  item: Mastodon.Status
  queryKey: App.QueryKey
}

// When the poll is long
const TimelineDefault: React.FC<Props> = ({ item, queryKey }) => {
  const navigation = useNavigation()

  let actualStatus = item.reblog ? item.reblog : item

  const statusView = useMemo(() => {
    return (
      <View style={styles.statusView}>
        {item.reblog && (
          <Actioned
            action='reblog'
            name={item.account.display_name || item.account.username}
            emojis={item.account.emojis}
          />
        )}
        <View style={styles.status}>
          <Avatar
            uri={actualStatus.account.avatar}
            id={actualStatus.account.id}
          />
          <View style={styles.details}>
            <HeaderDefault
              queryKey={queryKey}
              accountId={actualStatus.account.id}
              domain={actualStatus.uri.split(new RegExp(/\/\/(.*?)\//))[1]}
              name={
                actualStatus.account.display_name ||
                actualStatus.account.username
              }
              emojis={actualStatus.account.emojis}
              account={actualStatus.account.acct}
              created_at={item.created_at}
              application={item.application}
            />
            {/* Can pass toot info to next page to speed up performance */}
            <Pressable
              onPress={() =>
                navigation.navigate('Screen-Shared-Toot', {
                  toot: actualStatus.id
                })
              }
            >
              {actualStatus.content ? (
                <Content
                  content={actualStatus.content}
                  emojis={actualStatus.emojis}
                  mentions={actualStatus.mentions}
                  spoiler_text={actualStatus.spoiler_text}
                  // tags={actualStatus.tags}
                  // style={{ flex: 1 }}
                />
              ) : (
                <></>
              )}
              {actualStatus.poll && <Poll poll={actualStatus.poll} />}
              {actualStatus.media_attachments.length > 0 && (
                <Attachment
                  media_attachments={actualStatus.media_attachments}
                  sensitive={actualStatus.sensitive}
                  width={
                    Dimensions.get('window').width -
                    constants.SPACING_M * 2 -
                    50 -
                    8
                  }
                />
              )}
              {actualStatus.card && <Card card={actualStatus.card} />}
            </Pressable>
            <ActionsStatus queryKey={queryKey} status={actualStatus} />
          </View>
        </View>
      </View>
    )
  }, [item])

  return statusView
}

const styles = StyleSheet.create({
  statusView: {
    flex: 1,
    flexDirection: 'column',
    padding: constants.GLOBAL_PAGE_PADDING
  },
  status: {
    flex: 1,
    flexDirection: 'row'
  },
  details: {
    flex: 1,
    flexGrow: 1
  }
})

export default TimelineDefault
