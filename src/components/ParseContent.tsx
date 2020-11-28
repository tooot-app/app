import React, { useCallback } from 'react'
import { Text } from 'react-native'
import HTMLView, { HTMLViewNode } from 'react-native-htmlview'
import { useNavigation } from '@react-navigation/native'

import Emojis from 'src/components/Timelines/Timeline/Shared/Emojis'
import { useTheme } from 'src/utils/styles/ThemeManager'

// Prevent going to the same hashtag multiple times
const renderNode = ({
  theme,
  node,
  index,
  navigation,
  mentions,
  showFullLink
}: {
  theme: any
  node: any
  index: number
  navigation: any
  mentions?: Mastodon.Mention[]
  showFullLink: boolean
}) => {
  if (node.name == 'a') {
    const classes = node.attribs.class
    const href = node.attribs.href
    if (classes) {
      if (classes.includes('hashtag')) {
        return (
          <Text
            key={index}
            style={{ color: theme.link }}
            onPress={() => {
              const tag = href.split(new RegExp(/\/tag\/(.*)|\/tags\/(.*)/))
              navigation.push('Screen-Shared-Hashtag', {
                hashtag: tag[1] || tag[2]
              })
            }}
          >
            {node.children[0].data}
            {node.children[1]?.children[0].data}
          </Text>
        )
      } else if (classes.includes('mention') && mentions) {
        return (
          <Text
            key={index}
            style={{ color: theme.link }}
            onPress={() => {
              const username = href.split(new RegExp(/@(.*)/))
              const usernameIndex = mentions.findIndex(
                m => m.username === username[1]
              )
              navigation.push('Screen-Shared-Account', {
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
          style={{ color: theme.link }}
          onPress={() => {
            navigation.navigate('Screen-Shared-Webview', {
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

export interface Props {
  content: string
  size: number
  emojis?: Mastodon.Emoji[]
  mentions?: Mastodon.Mention[]
  showFullLink?: boolean
  linesTruncated?: number
}

const ParseContent: React.FC<Props> = ({
  content,
  size,
  emojis,
  mentions,
  showFullLink = false,
  linesTruncated = 10
}) => {
  const navigation = useNavigation()
  const { theme } = useTheme()

  const renderNodeCallback = useCallback(
    (node, index) =>
      renderNode({ theme, node, index, navigation, mentions, showFullLink }),
    []
  )
  const textComponent = useCallback(
    ({ children }) =>
      emojis && children ? (
        <Emojis content={children.toString()} emojis={emojis} size={size} />
      ) : (
        <Text>{children}</Text>
      ),
    []
  )
  const rootComponent = useCallback(({ children }) => {
    return <Text numberOfLines={linesTruncated}>{children}</Text>
  }, [])

  return (
    <HTMLView
      value={content}
      TextComponent={textComponent}
      RootComponent={rootComponent}
      renderNode={renderNodeCallback}
    />
  )
}

export default ParseContent
