import React, { useCallback } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { Image } from 'react-native-expo-image-cache'
import { StyleConstants } from '@utils/styles/constants'
import { useNavigation } from '@react-navigation/native'

export interface Props {
  queryKey?: QueryKey.Timeline
  account: Mastodon.Account
}

const TimelineAvatar: React.FC<Props> = ({ queryKey, account }) => {
  const navigation = useNavigation()
  // Need to fix go back root
  const onPress = useCallback(() => {
    queryKey && navigation.push('Screen-Shared-Account', { account })
  }, [])

  return (
    <Pressable style={styles.avatar} onPress={onPress}>
      <Image uri={account.avatar_static} style={styles.image} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  avatar: {
    flexBasis: StyleConstants.Avatar.M,
    height: StyleConstants.Avatar.M,
    marginRight: StyleConstants.Spacing.S
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 6
  }
})

export default React.memo(TimelineAvatar, () => true)
