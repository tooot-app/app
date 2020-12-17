import React, { useContext, useEffect, useRef } from 'react'
import { Animated, Dimensions, Image, StyleSheet } from 'react-native'
import { AccountContext } from '../Account'

export interface Props {
  uri?: Mastodon.Account['header']
  limitHeight?: boolean
}

const AccountHeader: React.FC<Props> = ({ uri, limitHeight = false }) => {
  const { accountState, accountDispatch } = useContext(AccountContext)

  useEffect(() => {
    if (uri) {
      if (uri.includes('/headers/original/missing.png')) {
        animateNewSize(accountState.headerRatio)
      } else {
        Image.getSize(
          uri,
          (width, height) => {
            if (!limitHeight) {
              accountDispatch({ type: 'headerRatio', payload: height / width })
            }
            animateNewSize(
              limitHeight ? accountState.headerRatio : height / width
            )
          },
          () => {
            animateNewSize(accountState.headerRatio)
          }
        )
      }
    } else {
      animateNewSize(accountState.headerRatio)
    }
  }, [uri])

  const windowWidth = Dimensions.get('window').width
  const imageHeight = useRef(
    new Animated.Value(windowWidth * accountState.headerRatio)
  ).current
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
