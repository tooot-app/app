import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import HTML from 'react-native-render-html'

import relative_time from '../utils/relative-time'

export default function TootTimeline ({ item }) {
  return (
    <View style={styles.tootTimeline}>
      <View style={styles.header}>
        <Image source={{ uri: item.account.avatar }} style={styles.avatar} />
        <View>
          <View style={styles.name}>
            <Text>{item.account.display_name}</Text>
            <Text>{item.account.acct}</Text>
          </View>
          <View>
            <Text>{relative_time(item.created_at)}</Text>
            {item.application && item.application.name !== 'Web' && (
              <Text onPress={() => Linking.openURL(item.application.website)}>
                {item.application.name}
              </Text>
            )}
          </View>
        </View>
      </View>
      {item.content ? <HTML html={item.content} /> : <></>}
    </View>
  )
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
