import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text } from 'react-native'
import HTMLView from 'react-native-htmlview'
import { useNavigation } from '@react-navigation/native'

import Emojis from 'src/components/TootTimeline/Emojis'

function renderNode ({ node, index, navigation, mentions, showFullLink }) {
  if (node.name == 'a') {
    const classes = node.attribs.class
    const href = node.attribs.href
    if (classes) {
      if (classes.includes('hashtag')) {
        return (
          <Text
            key={index}
            style={styles.a}
            onPress={() => {
              const tag = href.split(new RegExp(/\/tag\/(.*)|\/tags\/(.*)/))
              navigation.navigate('Hashtag', {
                hashtag: tag[1] || tag[2]
              })
            }}
          >
            {node.children[0].data}
            {node.children[1]?.children[0].data}
          </Text>
        )
      } else if (classes.includes('mention')) {
        return (
          <Text
            key={index}
            style={styles.a}
            onPress={() => {
              const username = href.split(new RegExp(/@(.*)/))
              const usernameIndex = mentions.findIndex(
                m => m.username === username[1]
              )
              navigation.navigate('Account', {
                id: mentions[usernameIndex].id
              })
            }}
          >
            {node.children[0].data}
            {node.children[1]?.children[0].data}
          </Text>
        )
      }
    } else {
      const domain = href.split(new RegExp(/:\/\/(.*?)\//))
      return (
        <Text
          key={index}
          style={styles.a}
          onPress={() => {
            navigation.navigate('Webview', {
              uri: href,
              domain: domain[1]
            })
          }}
        >
          {showFullLink ? href : domain[1]}
        </Text>
      )
    }
  }
}

export default function ParseContent ({
  content,
  emojis,
  emojiSize = 14,
  mentions,
  showFullLink = false
}) {
  const navigation = useNavigation()

  return (
    <HTMLView
      value={content}
      stylesheet={HTMLstyles}
      addLineBreaks={null}
      renderNode={(node, index) =>
        renderNode({ node, index, navigation, mentions, showFullLink })
      }
      TextComponent={({ children }) => (
        <Emojis content={children} emojis={emojis} dimension={emojiSize} />
      )}
    />
  )
}

const styles = StyleSheet.create({
  a: {
    color: 'blue'
  }
})

const HTMLstyles = StyleSheet.create({
  p: {
    marginBottom: 12
  }
})

ParseContent.propTypes = {
  content: PropTypes.string.isRequired,
  emojis: Emojis.propTypes.emojis,
  emojiSize: PropTypes.number,
  mentions: PropTypes.arrayOf(
    PropTypes.exact({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      acct: PropTypes.string.isRequired
    })
  ),
  showFullLink: PropTypes.bool
}
