import React, { useEffect, useState } from 'react'
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import HTMLView from 'react-native-htmlview'
import { useDispatch, useSelector } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'

import * as accountSlice from 'src/stacks/common/accountSlice'
import * as relationshipsSlice from 'src/stacks/common/relationshipsSlice'

import ParseContent from 'src/components/ParseContent'

// Moved account example: https://m.cmx.im/web/accounts/27812

function Header ({ uri, size }) {
  if (uri) {
    return (
      <Image
        source={{ uri: uri }}
        style={styles.header(size ? size.height / size.width : 1 / 2)}
      />
    )
  } else {
    return <View style={styles.header(1 / 3)} />
  }
}

function Information ({ account, emojis }) {
  return (
    <View style={styles.information}>
      {/* <Text>Moved or not: {account.moved}</Text> */}
      <Image source={{ uri: account.avatar }} style={styles.avatar} />

      <Text style={styles.display_name}>
        {account.display_name || account.username}
        {account.bot && (
          <Feather name='hard-drive' style={styles.display_name} />
        )}
      </Text>
      <Text style={styles.account}>
        {account.acct}
        {account.locked && <Feather name='lock' />}
      </Text>

      {account.fields &&
        account.fields.map((field, index) => (
          <View key={index} style={{ flex: 1, flexDirection: 'row' }}>
            <Text style={{ width: '30%', alignSelf: 'center' }}>
              <ParseContent content={field.name} emojis={emojis} showFullLink />{' '}
              {field.verified_at && <Feather name='check-circle' />}
            </Text>
            <Text style={{ width: '70%' }}>
              <ParseContent
                content={field.value}
                emojis={emojis}
                showFullLink
              />
            </Text>
          </View>
        ))}

      <Text>
        <ParseContent content={account.note} emojis={emojis} />
      </Text>
      <Text>
        加入时间{' '}
        {new Date(account.created_at).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Text>

      <Text>Toots: {account.statuses_count}</Text>
      <Text>Followers: {account.followers_count}</Text>
      <Text>Following: {account.following_count}</Text>
    </View>
  )
}

export default function Account ({
  route: {
    params: { id }
  }
}) {
  const dispatch = useDispatch()
  const accountState = useSelector(accountSlice.retrive)
  // const stateRelationships = useSelector(relationshipsState)
  const [loaded, setLoaded] = useState(false)
  const [headerImageSize, setHeaderImageSize] = useState()

  useEffect(() => {
    if (accountState.status === 'idle') {
      dispatch(accountSlice.fetch({ id }))
    }

    if (accountState.account.header) {
      Image.getSize(accountState.account.header, (width, height) => {
        setHeaderImageSize({ width, height })
        setLoaded(true)
      })
    } else {
      setLoaded(true)
    }
  }, [accountState, dispatch])

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused

      return () => {
        dispatch(accountSlice.reset())
      }
    }, [])
  )
  // add emoji support
  return loaded ? (
    <ScrollView>
      <Header
        uri={accountState.account.header}
        size={
          headerImageSize && {
            width: headerImageSize.width,
            height: headerImageSize.height
          }
        }
      />
      <Information
        account={accountState.account}
        emojis={accountState.emojis}
      />
    </ScrollView>
  ) : (
    <></>
  )
}

const styles = StyleSheet.create({
  header: ratio => ({
    width: '100%',
    height: Dimensions.get('window').width * ratio,
    backgroundColor: 'gray'
  }),
  information: { marginTop: -30, paddingLeft: 12, paddingRight: 12 },
  avatar: {
    width: 90,
    height: 90
  },
  display_name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12
  },
  account: {
    marginTop: 4
  }
})
