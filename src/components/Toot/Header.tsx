import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import Emojis from './Emojis'
import relativeTime from 'src/utils/relativeTime'

export interface Props {
  name: string
  emojis?: mastodon.Emoji[]
  account: string
  created_at: string
  application?: mastodon.Application
}

const Header: React.FC<Props> = ({
  name,
  emojis,
  account,
  created_at,
  application
}) => {
  const navigation = useNavigation()
  const [since, setSince] = useState(relativeTime(created_at))

  // causing full re-render
  useEffect(() => {
    setTimeout(() => {
      setSince(relativeTime(created_at))
    }, 1000)
  }, [since])

  return (
    <View>
      <View style={styles.names}>
        <View style={styles.name}>
          {emojis ? (
            <Emojis content={name} emojis={emojis} dimension={14} />
          ) : (
            <Text>{name}</Text>
          )}
        </View>
        <Text style={styles.account} numberOfLines={1}>
          @{account}
        </Text>
      </View>
      <View style={styles.meta}>
        <View>
          <Text style={styles.created_at}>{since}</Text>
        </View>
        {application && application.name !== 'Web' && (
          <View>
            <Text
              onPress={() => {
                navigation.navigate('Webview', {
                  uri: application.website
                })
              }}
              style={styles.application}
            >
              {application.name}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  names: {
    flexDirection: 'row'
  },
  name: {
    flexDirection: 'row',
    marginRight: 8
  },
  account: {
    fontSize: 12,
    lineHeight: 14
  },
  meta: {
    flexDirection: 'row'
  },
  created_at: {
    fontSize: 12,
    lineHeight: 12,
    marginTop: 8,
    marginBottom: 8,
    marginRight: 8
  },
  application: {
    fontSize: 12,
    lineHeight: 11
  }
})

export default Header
