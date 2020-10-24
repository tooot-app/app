import PropTypes from 'prop-types'
import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import HTML from 'react-native-render-html'

import relativeTime from 'src/utils/relativeTime'

export default function TootTimeline ({ item, notification }) {
  return (
    <View style={styles.tootTimeline}>
      <View style={styles.header}>
        <Image
          source={{
            uri: item.reblog ? item.reblog.account.avatar : item.account.avatar
          }}
          style={styles.avatar}
        />
        <View>
          <View style={styles.name}>
            <Text>
              {item.reblog
                ? item.reblog.account.display_name
                : item.account.display_name}
            </Text>
            <Text>
              {item.reblog ? item.reblog.account.acct : item.account.acct}
            </Text>
          </View>
          <View>
            <Text>{relativeTime(item.created_at)}</Text>
            {item.application && item.application.name !== 'Web' && (
              <Text onPress={() => Linking.openURL(item.application.website)}>
                {item.application.name}
              </Text>
            )}
          </View>
        </View>
      </View>
      {notification ? (
        <HTML html={item.status.content} />
      ) : item.content ? (
        <HTML html={item.content} />
      ) : (
        <></>
      )}
    </View>
  )
}

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

const styles = StyleSheet.create({
  tootTimeline: {
    flex: 1,
    padding: 15
  },
  header: {
    flexDirection: 'row'
  },
  avatar: {
    width: 40,
    height: 40
  },
  name: {
    flexDirection: 'row'
  }
})
