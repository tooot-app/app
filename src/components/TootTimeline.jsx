import PropTypes from 'prop-types'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import Reblog from './TootTimeline/Reblog'
import Avatar from './TootTimeline/Avatar'
import Header from './TootTimeline/Header'
import Content from './TootTimeline/Content'
import Actions from './TootTimeline/Actions'

export default function TootTimeline ({ item, notification }) {
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
        <View style={{flexGrow: 1}}>
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
            content={notification ? item.status.content : item.content}
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
    flexDirection: 'row'
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
