import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View } from 'react-native'

import Emojis from './Emojis'
import relativeTime from 'src/utils/relativeTime'

export default function Header ({
  name,
  emojis,
  account,
  created_at,
  application
}) {
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
          <Emojis content={name} emojis={emojis} dimension={14} />
        </View>
        <Text style={styles.account}>@{account}</Text>
      </View>
      <View style={styles.meta}>
        <View>
          <Text style={styles.created_at}>{since}</Text>
        </View>
        {application && application.name !== 'Web' && (
          <View>
            <Text
              onPress={() => Linking.openURL(application.website)}
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

Header.propTypes = {
  name: PropTypes.string.isRequired,
  emojis: Emojis.propTypes.emojis,
  account: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
  application: PropTypes.exact({
    name: PropTypes.string.isRequired,
    website: PropTypes.string
  })
}
