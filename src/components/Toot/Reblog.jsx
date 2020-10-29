import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import Emojis from './Emojis'

export default function Reblog ({ name, emojis }) {
  return (
    <View style={styles.reblog}>
      <Feather name='repeat' size={12} color='black' style={styles.icon} />
      <View style={styles.name}>
        <Emojis content={name} emojis={emojis} dimension={12} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  reblog: {
    flexDirection: 'row',
    marginBottom: 8
  },
  icon: {
    marginLeft: 50 - 12,
    marginRight: 8
  },
  name: {
    flexDirection: 'row'
  }
})

Reblog.propTypes = {
  name: PropTypes.string.isRequired,
  emojis: Emojis.propTypes.emojis
}
