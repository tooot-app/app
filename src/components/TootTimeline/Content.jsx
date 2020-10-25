import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import HTMLView from 'react-native-htmlview'

import Emojis from './Emojis'

function renderNode (navigation, node, index, mentions) {
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
          {domain[1]}
        </Text>
      )
    }
  }
}

export default function Content ({
  content,
  emojis,
  media_attachments,
  mentions,
  tags
}) {
  const navigation = useNavigation()

  return content ? (
    <HTMLView
      value={content}
      renderNode={(node, index) =>
        renderNode(navigation, node, index, mentions)
      }
      TextComponent={({ children }) => (
        <Emojis content={children} emojis={emojis} dimension={14} />
      )}
    />
  ) : (
    <></>
  )
}

const styles = StyleSheet.create({
  a: {
    color: 'blue'
  }
})

Content.propTypes = {
  content: PropTypes.string
}
