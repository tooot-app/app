import React, { useCallback } from 'react'
import { Image, Pressable, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from 'src/utils/styles/constants'

export interface Props {
  account: Mastodon.Account
}

const TimelineAvatar: React.FC<Props> = ({ account }) => {
  const navigation = useNavigation()
  // Need to fix go back root
  const onPress = useCallback(() => {
    navigation.navigate('Screen-Shared-Account', {
      id: account.id
    })
  }, [])

  return (
    <Pressable style={styles.avatar} onPress={onPress}>
      <Image source={{ uri: account.avatar }} style={styles.image} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  avatar: {
    flexBasis: StyleConstants.Avatar.S,
    height: StyleConstants.Avatar.S,
    marginRight: StyleConstants.Spacing.S
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 6
  }
})

export default React.memo(TimelineAvatar, () => true)
