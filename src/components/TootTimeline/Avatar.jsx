import React from 'react'
import PropTypes from 'prop-types'
import { Image, StyleSheet, View } from 'react-native'

export default function Avatar ({ uri }) {
  return <Image source={{ uri: uri }} style={styles.avatar} />
}

const styles = StyleSheet.create({
  avatar: {
    width: 50,
    height: 50,
    marginRight: 8
  }
})

Avatar.propTypes = {
  uri: PropTypes.string.isRequired
}
