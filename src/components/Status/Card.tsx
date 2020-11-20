import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export interface Props {
  card: Mastodon.Card
}

const Card: React.FC<Props> = ({ card }) => {
  const navigation = useNavigation()
  return (
    card && (
      <Pressable
        style={styles.card}
        onPress={() => {
          navigation.navigate('Webview', {
            uri: card.url
          })
        }}
      >
        {card.image && (
          <View style={styles.left}>
            <Image source={{ uri: card.image }} style={styles.image} />
          </View>
        )}
        <View style={styles.right}>
          <Text numberOfLines={1}>{card.title}</Text>
          {card.description ? (
            <Text numberOfLines={2}>{card.description}</Text>
          ) : (
            <></>
          )}
          <Text numberOfLines={1}>{card.url}</Text>
        </View>
      </Pressable>
    )
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    height: 70,
    marginTop: 12
  },
  left: {
    width: 70
  },
  image: {
    width: '100%',
    height: '100%'
  },
  right: {
    flex: 1
  }
})

export default Card
