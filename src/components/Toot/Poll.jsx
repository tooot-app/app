import React from 'react'
import PropTypes from 'prop-types'
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
  poll: PropTypes.exact({
    id: PropTypes.string.isRequired,
    expires_at: PropTypes.string.isRequired,
    expired: PropTypes.bool.isRequired,
    multiple: PropTypes.bool.isRequired,
    votes_count: PropTypes.number,
    voters_count: PropTypes.number,
    voted: PropTypes.bool.isRequired,
    own_votes: PropTypes.array,
    options: PropTypes.arrayOf(
      PropTypes.exact({
        title: PropTypes.string.isRequired,
        votes_count: PropTypes.number.isRequired
      })
    ),
    emojis: Emojis.propTypes.emojis
  }).isRequired
}
