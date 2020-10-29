import React from 'react'
import PropTypes from 'prop-types'
import { Image, Pressable, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export default function Avatar ({ uri, id }) {
  const navigation = useNavigation()
  // Need to fix go back root
  return (
    <Pressable
      style={styles.avatar}
      onPress={() => {
        navigation.navigate('Account', {
          id: id
        })
      }}
    >
      <Image source={{ uri: uri }} style={styles.image} />
    </Pressable>
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

Avatar.propTypes = {
  uri: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
}
