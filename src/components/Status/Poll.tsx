import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import Emojis from './Emojis'

export interface Props {
  poll: Mastodon.Poll
}
// When haven't voted, result should not be shown but intead let people vote
const Poll: React.FC<Props> = ({ poll }) => {
  return (
    <View>
      {poll.options.map((option, index) => (
        <View key={index}>
          <View style={{ flexDirection: 'row' }}>
            <Text>
              {Math.round((option.votes_count / poll.votes_count) * 100)}%
            </Text>
            <Emojis
              content={option.title}
              emojis={poll.emojis}
              dimension={14}
            />
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

export default Poll
