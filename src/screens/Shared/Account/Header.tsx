import React, { Dispatch, useEffect, useState } from 'react'
import { Dimensions, Image, StyleSheet, View } from 'react-native'
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
  const [ratio, setRatio] = useState(accountState.headerRatio)

  let isMounted = false
  useEffect(() => {
    isMounted = true

    return () => {
      isMounted = false
    }
  })
  useEffect(() => {
    if (
      account?.header &&
      !account.header.includes('/headers/original/missing.png')
    ) {
      isMounted &&
        Image.getSize(account.header, (width, height) => {
          if (!limitHeight) {
            accountDispatch &&
              accountDispatch({
                type: 'headerRatio',
                payload: height / width
              })
          }
          isMounted &&
            setRatio(limitHeight ? accountState.headerRatio : height / width)
        })
    } else {
      isMounted && setRatio(1 / 5)
    }
  }, [account, isMounted])

  const windowWidth = Dimensions.get('window').width

  return (
    <View style={[styles.imageContainer, { height: windowWidth * ratio }]}>
      <Image source={{ uri: account?.header }} style={styles.image} />
    </View>
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
