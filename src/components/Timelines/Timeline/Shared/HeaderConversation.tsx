import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import relativeTime from 'src/utils/relativeTime'
import Emojis from './Emojis'

export interface Props {
  account: Mastodon.Account
  created_at?: Mastodon.Status['created_at']
}

const HeaderConversation: React.FC<Props> = ({ account, created_at }) => {
  return (
    <View>
      <View style={styles.nameAndDate}>
        <View style={styles.name}>
          {account.emojis ? (
            <Emojis
              content={account.display_name || account.username}
              emojis={account.emojis}
              size={14}
            />
          ) : (
            <Text numberOfLines={1}>
              {account.display_name || account.username}
            </Text>
          )}
        </View>
        {created_at && (
          <View>
            <Text style={styles.created_at}>{relativeTime(created_at)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.account} numberOfLines={1}>
        @{account.acct}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  nameAndDate: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  name: {
    flexDirection: 'row',
    marginRight: 8,
    fontWeight: '900'
  },
  created_at: {
    fontSize: 12,
    lineHeight: 12,
    marginTop: 8,
    marginBottom: 8,
    marginRight: 8
  },
  account: {
    lineHeight: 14,
    flexShrink: 1
  }
})

export default HeaderConversation
