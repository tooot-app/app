import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions, Image, StyleSheet } from 'react-native'

export interface Props {
  uri?: Mastodon.Account['header']
  limitHeight?: boolean
}

const limitRatio = 0.4

const AccountHeader: React.FC<Props> = ({ uri, limitHeight = false }) => {
  useEffect(() => {
    if (uri) {
      if (uri.includes('/headers/original/missing.png')) {
        animateNewSize(limitRatio)
      } else {
        Image.getSize(
          uri,
          (width, height) => {
            animateNewSize(limitHeight ? limitRatio : height / width)
          },
          () => {
            animateNewSize(limitRatio)
          }
        )
      }
    } else {
      animateNewSize(limitRatio)
    }
  }, [uri])

  const windowWidth = Dimensions.get('window').width
  const imageHeight = useRef(new Animated.Value(windowWidth * limitRatio))
    .current
  const animateNewSize = (ratio: number) => {
    Animated.timing(imageHeight, {
      toValue: windowWidth * ratio,
      duration: 350,
      useNativeDriver: false
    }).start()
  }

  return (
    <Animated.View style={[styles.imageContainer, { height: imageHeight }]}>
      <Image source={{ uri: uri }} style={styles.image} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    backgroundColor: 'lightgray'
  },
  image: {
    width: '100%',
    height: '100%'
  }
})

export default AccountHeader
