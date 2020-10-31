import React from 'react'
import PropTypes from 'prop-types'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import action from 'src/components/action'

export default function Actions ({
  id,
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
      <Pressable style={styles.action} onPress={() => action('favourite', id)}>
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
    flexDirection: 'row',
    marginTop: 4
  },
  action: {
    width: '25%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 8
  }
})

Actions.propTypes = {
  id: PropTypes.string.isRequired,
  replies_count: PropTypes.number.isRequired,
  reblogs_count: PropTypes.number.isRequired,
  reblogged: PropTypes.bool.isRequired,
  favourites_count: PropTypes.number.isRequired,
  favourited: PropTypes.bool.isRequired
}
