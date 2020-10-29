import React from 'react'
import propTypesPoll from 'src/prop-types/poll'
import { StyleSheet, Text, View } from 'react-native'

import Emojis from './Emojis'

export default function Poll ({ poll }) {
  return (
    <View>
      {poll.options.map((option, index) => (
        <View key={index}>
          <View style={{ flexDirection: 'row' }}>
            <Text>
              {Math.round((option.votes_count / poll.votes_count) * 100)}%
            </Text>
            <Text>{option.title}</Text>
          </View>
          <View
            style={{
              width: `${Math.round(
                (option.votes_count / poll.votes_count) * 100
              )}%`,
              height: 5,
              backgroundColor: 'blue'
            }}
          />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    width: 50,
    height: 50,
    marginRight: 8
  },
  image: {
    width: '100%',
    height: '100%'
  }
})

Poll.propTypes = {
  poll: propTypesPoll
}
