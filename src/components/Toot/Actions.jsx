import React from 'react'
import PropTypes from 'prop-types'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

export default function Actions ({
  replies_count,
  reblogs_count,
  reblogged,
  favourites_count,
  favourited
}) {
  return (
    <View style={styles.actions}>
      <Pressable style={styles.action}>
        <Feather name='message-circle' />
        <Text>{replies_count}</Text>
      </Pressable>
      <Pressable style={styles.action}>
        <Feather name='repeat' />
        <Text>{reblogs_count}</Text>
      </Pressable>
      <Pressable style={styles.action}>
        <Feather name='heart' />
        <Text>{favourites_count}</Text>
      </Pressable>
      <Pressable style={styles.action}>
        <Feather name='share' />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: {
    flex: 1,
    flexDirection: 'row'
  },
  action: {
    width: '25%',
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

// Actions.propTypes = {
//   uri: PropTypes.string
// }
