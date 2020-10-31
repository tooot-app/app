import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import action from 'src/components/action'

export interface Props {
  id: string
  replies_count: number
  reblogs_count: number
  reblogged?: boolean
  favourites_count: number
  favourited?: boolean
}

const Actions: React.FC<Props> = ({
  id,
  replies_count,
  reblogs_count,
  reblogged,
  favourites_count,
  favourited
}) => {
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
      <Pressable
        style={styles.action}
        onPress={() =>
          action({
            id,
            type: 'favourite',
            stateKey: 'favourited',
            statePrev: favourited || false
          })
        }
      >
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

export default Actions
