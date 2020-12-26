import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import HTMLView from 'react-native-htmlview'
import { useNavigation } from '@react-navigation/native'
import Emojis from '@components/Timelines/Timeline/Shared/Emojis'
import { useTheme } from '@utils/styles/ThemeManager'
import { Feather } from '@expo/vector-icons'
import { StyleConstants } from '@utils/styles/constants'
import openLink from '@root/utils/openLink'

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
              color: theme.blue,
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
              color: theme.blue,
              fontSize: StyleConstants.Font.Size[size]
            }}
            onPress={() => {
              const username = href.split(new RegExp(/@(.*)/))
              const usernameIndex = mentions.findIndex(
                m => m.username === username[1]
              )
              navigation.push('Screen-Shared-Account', {
                account: mentions[usernameIndex]
              })
            }}
          >
            {node.children[0].data}
            {node.children[1]?.children[0].data}
          </Text>
        )
      }
    } else {
      const domain = href.split(new RegExp(/:\/\/(.[^\/]+)/))
      return (
        <Text
          key={index}
          style={{
            color: theme.blue,
            fontSize: StyleConstants.Font.Size[size]
          }}
          onPress={async () => await openLink(href)}
        >
          <Feather
            name='external-link'
            size={StyleConstants.Font.Size[size]}
            color={theme.blue}
          />{' '}
          {showFullLink ? href : domain[1]}
        </Text>
      )
    }
  } else {
    if (node.name === 'p') {
      if (!node.children.length) {
        return <View key={index} /> // bug when the tag is empty
      }
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
  expandHint?: string
}

const ParseContent: React.FC<Props> = ({
  content,
  size,
  emojis,
  mentions,
  showFullLink = false,
  numberOfLines = 10,
  expandHint = '全文'
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
  const textComponent = useCallback(({ children }) => {
    if (children) {
      return emojis ? (
        <Emojis
          content={children.toString()}
          emojis={emojis}
          size={StyleConstants.Font.Size[size]}
        />
      ) : (
        <Text>{children}</Text>
      )
    } else {
      return null
    }
  }, [])
  const rootComponent = useCallback(
    ({ children }) => {
      const lineHeight = StyleConstants.Font.LineHeight[size]

      const [heightOriginal, setHeightOriginal] = useState<number>()
      const [heightTruncated, setHeightTruncated] = useState<number>()
      const [allowExpand, setAllowExpand] = useState(false)
      const [showAllText, setShowAllText] = useState(false)

      const calNumberOfLines = useMemo(() => {
        if (heightOriginal) {
          if (!heightTruncated) {
            return numberOfLines
          } else {
            if (allowExpand && !showAllText) {
              return numberOfLines
            } else {
              return undefined
            }
          }
        } else {
          return undefined
        }
      }, [heightOriginal, heightTruncated, allowExpand, showAllText])

      return (
        <View>
          <Text
            style={{ lineHeight, color: theme.primary }}
            children={children}
            numberOfLines={calNumberOfLines}
            onLayout={({ nativeEvent }) => {
              if (!heightOriginal) {
                setHeightOriginal(nativeEvent.layout.height)
              } else {
                if (!heightTruncated) {
                  setHeightTruncated(nativeEvent.layout.height)
                } else {
                  if (heightOriginal > heightTruncated) {
                    setAllowExpand(true)
                  }
                }
              }
            }}
          />
          {allowExpand && (
            <Pressable
              onPress={() => {
                setShowAllText(!showAllText)
              }}
              style={{ marginTop: showAllText ? 0 : -lineHeight * 1.25 }}
            >
              <LinearGradient
                colors={[
                  theme.backgroundGradientStart,
                  theme.backgroundGradientEnd
                ]}
                locations={[0, lineHeight / (StyleConstants.Font.Size.S * 4)]}
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
                  {`${showAllText ? '折叠' : '展开'}${expandHint}`}
                </Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>
      )
    },
    [theme]
  )

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
