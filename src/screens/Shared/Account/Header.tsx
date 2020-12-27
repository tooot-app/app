import { useTheme } from '@root/utils/styles/ThemeManager'
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
  const { theme } = useTheme()
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
      isMounted && setRatio(1 / 3)
    }
  }, [account, isMounted])

  const windowWidth = Dimensions.get('window').width

  return (
    <View
      style={{
        height: windowWidth * ratio,
        backgroundColor: theme.disabled
      }}
    >
      <Image source={{ uri: account?.header }} style={styles.image} />
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%'
  }
})

export default AccountHeader
