import React, { Dispatch, useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Image, StyleSheet } from 'react-native'
import { AccountAction, AccountState } from '../Account'

export interface Props {
  accountState: AccountState
  accountDispatch?: Dispatch<AccountAction>
  account?: Mastodon.Account
  limitHeight?: boolean
}

const AccountHeader: React.FC<Props> = ({
  accountState,
  accountDispatch,
  account,
  limitHeight = false
}) => {
  const [imageShown, setImageShown] = useState(true)

  useEffect(() => {
    if (account?.header) {
      if (account.header.includes('/headers/original/missing.png')) {
        animateNewSize(accountState.headerRatio)
      } else {
        if (account.header !== account.header_static) {
          setImageShown(false)
        }
        Image.getSize(
          account.header,
          (width, height) => {
            if (!limitHeight) {
              accountDispatch &&
                accountDispatch({
                  type: 'headerRatio',
                  payload: height / width
                })
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
    }
  }, [account])

  const theImage = imageShown ? (
    <Image source={{ uri: account?.header }} style={styles.image} />
  ) : null

  const windowWidth = Dimensions.get('window').width
  const imageHeight = useRef(
    new Animated.Value(windowWidth * accountState.headerRatio)
  ).current
  const animateNewSize = (ratio: number) => {
    Animated.timing(imageHeight, {
      toValue: windowWidth * ratio,
      duration: 350,
      useNativeDriver: false
    }).start(({ finished }) => {
      if (finished) {
        setImageShown(true)
      }
    })
  }

  return (
    <Animated.View style={[styles.imageContainer, { height: imageHeight }]}>
      {theImage}
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
