import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Dimensions, StyleSheet, View } from 'react-native'

import Reblog from './TootTimeline/Reblog'
import Avatar from './TootTimeline/Avatar'
import Header from './TootTimeline/Header'
import Content from './TootTimeline/Content'
import Actions from './TootTimeline/Actions'

// Maybe break away notification types? https://docs.joinmastodon.org/entities/notification/

export default function TootTimeline ({ item, notification }) {
  let contentAggregated = {}
  let actualContent
  if (notification && item.status) {
    actualContent = item.status
  } else if (item.reblog) {
    actualContent = item.reblog
  } else {
    actualContent = item
  }
  contentAggregated = {
    content: actualContent.content,
    emojis: actualContent.emojis,
    media_attachments: actualContent.media_attachments,
    mentions: actualContent.mentions,
    sensitive: actualContent.sensitive,
    spoiler_text: actualContent.spoiler_text,
    tags: actualContent.tags
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
        <Avatar
          uri={item.reblog?.account.avatar || item.account.avatar}
          id={item.reblog?.account.id || item.account.id}
        />
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
          <Content
            {...contentAggregated}
            style={{ flex: 1 }}
            width={Dimensions.get('window').width - 24 - 50 - 8}
          />
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
    flex: 1,
    flexGrow: 1
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
