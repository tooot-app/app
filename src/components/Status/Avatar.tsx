import React from 'react'
import { Image, Pressable, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export interface Props {
  uri: string
  id: string
}

const Avatar: React.FC<Props> = ({ uri, id }) => {
  const navigation = useNavigation()
  // Need to fix go back root
  return (
    <Pressable
      style={styles.avatar}
      onPress={() => {
        navigation.navigate('Screen-Shared-Account', {
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

export default Avatar
