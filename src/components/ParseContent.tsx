import React, { useCallback, useState } from 'react'
import { Pressable, Text } from 'react-native'
import HTMLView from 'react-native-htmlview'
import { useNavigation } from '@react-navigation/native'

import Emojis from '@components/Timelines/Timeline/Shared/Emojis'
import { useTheme } from '@utils/styles/ThemeManager'
import { Feather } from '@expo/vector-icons'
import { StyleConstants } from '@utils/styles/constants'
import { LinearGradient } from 'expo-linear-gradient'

// Prevent going to the same hashtag multiple times
const renderNode = ({
  theme,
  node,
  index,
  size,
  navigation,
  mentions,
  showFullLink
}: {
  theme: any
  node: any
  index: number
  size: 'M' | 'L'
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
            style={{
              color: theme.link,
              fontSize: StyleConstants.Font.Size[size]
            }}
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
            style={{
              color: theme.link,
              fontSize: StyleConstants.Font.Size[size]
            }}
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
          style={{
            color: theme.link,
            fontSize: StyleConstants.Font.Size[size]
          }}
          onPress={() => {
            navigation.navigate('Screen-Shared-Webview', {
              uri: href,
              domain: domain[1]
            })
          }}
        >
          <Feather
            name='external-link'
            size={StyleConstants.Font.Size[size]}
            color={theme.link}
          />{' '}
          {showFullLink ? href : domain[1]}
        </Text>
      )
    }
  }
}

export interface Props {
  content: string
  size: 'M' | 'L'
  emojis?: Mastodon.Emoji[]
  mentions?: Mastodon.Mention[]
  showFullLink?: boolean
  numberOfLines?: number
}

const ParseContent: React.FC<Props> = ({
  content,
  size,
  emojis,
  mentions,
  showFullLink = false,
  numberOfLines = 10
}) => {
  const navigation = useNavigation()
  const { theme } = useTheme()

  const renderNodeCallback = useCallback(
    (node, index) =>
      renderNode({
        theme,
        node,
        index,
        size,
        navigation,
        mentions,
        showFullLink
      }),
    []
  )
  const textComponent = useCallback(
    ({ children }) =>
      emojis && children ? (
        <Emojis
          content={children.toString()}
          emojis={emojis}
          size={StyleConstants.Font.Size[size]}
        />
      ) : (
        <Text>{children}</Text>
      ),
    []
  )
  const rootComponent = useCallback(({ children }) => {
    const { theme } = useTheme()
    const [textLoaded, setTextLoaded] = useState(false)
    const [totalLines, setTotalLines] = useState<number | undefined>()
    const [lineHeight, setLineHeight] = useState<number | undefined>()
    const [shownLines, setShownLines] = useState(numberOfLines)

    return (
      <>
        <Text
          numberOfLines={
            totalLines && totalLines > numberOfLines ? shownLines : totalLines
          }
          style={{ lineHeight: StyleConstants.Font.LineHeight[size] }}
          onTextLayout={({ nativeEvent }) => {
            if (!textLoaded) {
              setTextLoaded(true)
              setTotalLines(nativeEvent.lines.length)
              setLineHeight(nativeEvent.lines[0].height)
            }
          }}
        >
          {children}
        </Text>
        {totalLines && lineHeight && totalLines > shownLines && (
          <Pressable
            onPress={() => {
              setShownLines(totalLines)
            }}
            style={{
              marginTop: -lineHeight
            }}
          >
            <LinearGradient
              colors={[
                theme.backgroundGradientStart,
                theme.backgroundGradientEnd
              ]}
              locations={[0, lineHeight / (StyleConstants.Font.Size.S * 5)]}
              style={{
                paddingTop: StyleConstants.Font.Size.S * 2,
                paddingBottom: StyleConstants.Font.Size.S
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: StyleConstants.Font.Size.S,
                  color: theme.primary
                }}
              >
                展开全文
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      </>
    )
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
