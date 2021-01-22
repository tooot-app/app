import Icon from '@components/Icon'
import openLink from '@components/openLink'
import ParseEmojis from '@components/Parse/Emojis'
import { useNavigation, useRoute } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import HTMLView from 'react-native-htmlview'

// Prevent going to the same hashtag multiple times
const renderNode = ({
  routeParams,
  theme,
  node,
  index,
  size,
  navigation,
  mentions,
  tags,
  showFullLink,
  disableDetails
}: {
  routeParams?: any
  theme: any
  node: any
  index: number
  size: 'M' | 'L'
  navigation: any
  mentions?: Mastodon.Mention[]
  tags?: Mastodon.Tag[]
  showFullLink: boolean
  disableDetails: boolean
}) => {
  switch (node.name) {
    case 'a':
      const classes = node.attribs.class
      const href = node.attribs.href
      if (classes) {
        if (classes.includes('hashtag')) {
          const tag = href.split(new RegExp(/\/tag\/(.*)|\/tags\/(.*)/))
          const differentTag = routeParams?.hashtag
            ? routeParams.hashtag !== tag[1] && routeParams.hashtag !== tag[2]
            : true
          return (
            <Text
              key={index}
              style={{
                color: theme.blue,
                ...StyleConstants.FontStyle[size]
              }}
              onPress={() => {
                !disableDetails &&
                  differentTag &&
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
          const accountIndex = mentions.findIndex(
            mention => mention.url === href
          )
          const differentAccount = routeParams?.account
            ? routeParams.account.id !== mentions[accountIndex]?.id
            : true
          return (
            <Text
              key={index}
              style={{
                color: accountIndex !== -1 ? theme.blue : undefined,
                ...StyleConstants.FontStyle[size]
              }}
              onPress={() => {
                accountIndex !== -1 &&
                  !disableDetails &&
                  differentAccount &&
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
        const content =
          node.children && node.children[0] && node.children[0].data
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
              !disableDetails && !shouldBeTag
                ? await openLink(href)
                : navigation.push('Screen-Shared-Hashtag', {
                    hashtag: content.substring(1)
                  })
            }
          >
            {!shouldBeTag ? (
              <Icon
                color={theme.blue}
                name='ExternalLink'
                size={StyleConstants.Font.Size[size]}
              />
            ) : null}
            {content || (showFullLink ? href : domain[1])}
          </Text>
        )
      }
      break
    case 'p':
      if (!node.children.length) {
        return <View key={index} /> // bug when the tag is empty
      }
      break
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
  disableDetails?: boolean
}

const ParseHTML: React.FC<Props> = ({
  content,
  size = 'M',
  emojis,
  mentions,
  tags,
  showFullLink = false,
  numberOfLines = 10,
  expandHint,
  disableDetails = false
}) => {
  const navigation = useNavigation()
  const route = useRoute()
  const { theme } = useTheme()
  const { t, i18n } = useTranslation('componentParse')
  if (!expandHint) {
    expandHint = t('HTML.defaultHint')
  }

  const renderNodeCallback = useCallback(
    (node, index) =>
      renderNode({
        routeParams: route.params,
        theme,
        node,
        index,
        size,
        navigation,
        mentions,
        tags,
        showFullLink,
        disableDetails
      }),
    []
  )
  const textComponent = useCallback(({ children }) => {
    if (children) {
      return (
        <ParseEmojis
          content={children.toString()}
          emojis={emojis}
          size={size}
        />
      )
    } else {
      return null
    }
  }, [])
  const rootComponent = useCallback(
    ({ children }) => {
      const { t } = useTranslation('componentParse')
      const lineHeight = StyleConstants.Font.LineHeight[size]

      const [expandAllow, setExpandAllow] = useState(false)
      const [expanded, setExpanded] = useState(false)

      const onTextLayout = useCallback(({ nativeEvent }) => {
        if (
          nativeEvent.lines &&
          nativeEvent.lines.length === numberOfLines + 1
        ) {
          setExpandAllow(true)
        }
      }, [])

      return (
        <View style={{ overflow: 'hidden' }}>
          <Text
            children={children}
            onTextLayout={onTextLayout}
            numberOfLines={expanded ? 999 : numberOfLines + 1}
            style={{
              ...StyleConstants.FontStyle[size],
              color: theme.primary
            }}
          />
          {expandAllow ? (
            <Pressable
              onPress={() => {
                layoutAnimation()
                setExpanded(!expanded)
              }}
              style={{
                marginTop: expanded
                  ? 0
                  : -lineHeight * (numberOfLines === 0 ? 1 : 2)
              }}
            >
              <LinearGradient
                colors={[
                  theme.backgroundGradientStart,
                  theme.backgroundGradientEnd
                ]}
                locations={[
                  0,
                  lineHeight / (StyleConstants.Font.Size[size] * 5)
                ]}
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
                  {expanded
                    ? t('HTML.expanded.true', { hint: expandHint })
                    : t('HTML.expanded.false', { hint: expandHint })}
                </Text>
              </LinearGradient>
            </Pressable>
          ) : null}
        </View>
      )
    },
    [theme, i18n.language]
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

// export default ParseHTML
export default React.memo(ParseHTML, () => true)
