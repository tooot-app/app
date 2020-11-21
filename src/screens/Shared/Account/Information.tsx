import React, { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'
import { Feather } from '@expo/vector-icons'

import ParseContent from 'src/components/ParseContent'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformation: React.FC<Props> = ({ account }) => {
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  // add emoji support
  return (
    <View style={styles.information}>
      {/* <Text>Moved or not: {account.moved}</Text> */}
      <ShimmerPlaceholder visible={avatarLoaded} width={90} height={90}>
        <Image
          source={{ uri: account?.avatar }}
          style={styles.avatar}
          onLoadEnd={() => setAvatarLoaded(true)}
        />
      </ShimmerPlaceholder>

      <Text style={styles.display_name}>
        {account?.display_name || account?.username}
        {account?.bot && (
          <Feather name='hard-drive' style={styles.display_name} />
        )}
      </Text>
      <Text style={styles.account}>
        {account?.acct}
        {account?.locked && <Feather name='lock' />}
      </Text>

      {account?.fields &&
        account.fields.map((field, index) => (
          <View key={index} style={{ flex: 1, flexDirection: 'row' }}>
            <Text style={{ width: '30%', alignSelf: 'center' }}>
              <ParseContent
                content={field.name}
                emojis={account.emojis}
                showFullLink
              />{' '}
              {field.verified_at && <Feather name='check-circle' />}
            </Text>
            <Text style={{ width: '70%' }}>
              <ParseContent
                content={field.value}
                emojis={account.emojis}
                showFullLink
              />
            </Text>
          </View>
        ))}
      {account?.note && (
        <ParseContent content={account.note} emojis={account.emojis} />
      )}
      {account?.created_at && (
        <Text>
          加入时间{' '}
          {new Date(account.created_at).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      )}

      <Text>Toots: {account?.statuses_count}</Text>
      <Text>Followers: {account?.followers_count}</Text>
      <Text>Following: {account?.following_count}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
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

export default AccountInformation
