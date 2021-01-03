import Icon from '@components/Icon'
import openLink from '@components/openLink'
import ParseEmojis from '@components/Parse/Emojis'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import HTMLView from 'react-native-htmlview'

// Prevent going to the same hashtag multiple times
const renderNode = ({
  theme,
  node,
  index,
  size,
  navigation,
  mentions,
  tags,
  showFullLink
}: {
  theme: any
  node: any
  index: number
  size: 'M' | 'L'
  navigation: any
  mentions?: Mastodon.Mention[]
  tags?: Mastodon.Tag[]
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
              ...StyleConstants.FontStyle[size]
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
        const accountIndex = mentions.findIndex(mention => mention.url === href)
        return (
          <Text
            key={index}
            style={{
              color: accountIndex !== -1 ? theme.blue : undefined,
              ...StyleConstants.FontStyle[size]
            }}
            onPress={() => {
              accountIndex !== -1 &&
                navigation.push('Screen-Shared-Account', {
                  account: mentions[accountIndex]
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
      // Need example here
      const content = node.children && node.children[0] && node.children[0].data
      const shouldBeTag =
        tags && tags.filter(tag => `#${tag.name}` === content).length > 0
      return (
        <Text
          key={index}
          style={{
            color: theme.blue,
            ...StyleConstants.FontStyle[size]
          }}
          onPress={async () =>
            !shouldBeTag
              ? await openLink(href)
              : navigation.push('Screen-Shared-Hashtag', {
                  hashtag: content.substring(1)
                })
          }
        >
          {!shouldBeTag ? (
            <Icon
              inline
              color={theme.blue}
              name='ExternalLink'
              size={StyleConstants.Font.Size[size]}
            />
          ) : null}
          {content || (showFullLink ? href : domain[1])}
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
  size?: 'M' | 'L'
  emojis?: Mastodon.Emoji[]
  mentions?: Mastodon.Mention[]
  tags?: Mastodon.Tag[]
  showFullLink?: boolean
  numberOfLines?: number
  expandHint?: string
}

const ParseHTML: React.FC<Props> = ({
  content,
  size = 'M',
  emojis,
  mentions,
  tags,
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
        tags,
        showFullLink
      }),
    []
  )
  const textComponent = useCallback(({ children }) => {
    if (children) {
      return <ParseEmojis content={children.toString()} emojis={emojis} />
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
        if (numberOfLines === 0) {
          // For spoilers without calculation
          return showAllText ? undefined : 1
        } else {
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
        }
      }, [heightOriginal, heightTruncated, allowExpand, showAllText])

      const onLayout = useCallback(
        ({ nativeEvent }) => {
          if (numberOfLines === 0) {
            // For spoilers without calculation
            setAllowExpand(true)
          } else {
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
          }
        },
        [heightOriginal, heightTruncated]
      )

      return (
        <View>
          <Text
            style={{
              ...StyleConstants.FontStyle[size],
              color: theme.primary,
              overflow: 'hidden'
            }}
            children={children}
            numberOfLines={calNumberOfLines}
            onLayout={onLayout}
          />
          {allowExpand ? (
            <Pressable
              onPress={() => {
                layoutAnimation()
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
                    ...StyleConstants.FontStyle.S,
                    color: theme.primary
                  }}
                >
                  {`${showAllText ? '折叠' : '展开'}${expandHint}`}
                </Text>
              </LinearGradient>
            </Pressable>
          ) : null}
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

export default ParseHTML
