import PropTypes from 'prop-types'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import Reblog from './TootTimeline/Reblog'
import Avatar from './TootTimeline/Avatar'
import Header from './TootTimeline/Header'
import Content from './TootTimeline/Content'
import Actions from './TootTimeline/Actions'

// Maybe break away notification types? https://docs.joinmastodon.org/entities/notification/

export default function TootTimeline ({ item, notification }) {
  let contentAggregated = {}
  if (notification && item.status) {
    contentAggregated = {
      content: item.status.content,
      emojis: item.status.emojis,
      media_attachments: item.status.media_attachments,
      mentions: item.status.mentions,
      tags: item.status.tags
    }
  } else if (item.reblog) {
    contentAggregated = {
      content: item.reblog.content,
      emojis: item.reblog.emojis,
      media_attachments: item.reblog.media_attachments,
      mentions: item.reblog.mentions,
      tags: item.reblog.tags
    }
  } else {
    contentAggregated = {
      content: item.content,
      emojis: item.emojis,
      media_attachments: item.media_attachments,
      mentions: item.mentions,
      tags: item.tags
    }
  }

  return (
    <View style={styles.tootTimeline}>
      {item.reblog && (
        <Reblog
          name={item.account.display_name || item.account.username}
          emojis={item.account.emojis}
        />
      )}
      <View style={styles.toot}>
        <Avatar uri={item.reblog?.account.avatar || item.account.avatar} />
        <View style={styles.details}>
          <Header
            name={
              (item.reblog?.account.display_name
                ? item.reblog?.account.display_name
                : item.reblog?.account.username) ||
              (item.account.display_name
                ? item.account.display_name
                : item.account.username)
            }
            emojis={item.reblog?.account.emojis || item.account.emojis}
            account={item.reblog?.account.acct || item.account.acct}
            created_at={item.created_at}
            application={item.application || null}
          />
          <Content {...contentAggregated} />
        </View>
      </View>
      <Actions />
    </View>
  )
}

const styles = StyleSheet.create({
  tootTimeline: {
    flex: 1,
    flexDirection: 'column',
    padding: 12
  },
  toot: {
    flex: 1,
    flexDirection: 'row'
  },
  details: {
    flex: 1
  }
})

TootTimeline.propTypes = {
  item: PropTypes.shape({
    account: PropTypes.shape({
      avatar: PropTypes.string.isRequired,
      display_name: PropTypes.string.isRequired,
      acct: PropTypes.string.isRequired
    }).isRequired,
    created_at: PropTypes.string.isRequired,
    application: PropTypes.exact({
      name: PropTypes.string.isRequired,
      website: PropTypes.string
    }),
    content: PropTypes.string
  }).isRequired,
  notification: PropTypes.bool
}
