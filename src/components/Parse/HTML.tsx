import analytics from '@components/analytics'
import Icon from '@components/Icon'
import openLink from '@components/openLink'
import ParseEmojis from '@components/Parse/Emojis'
import { useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { getSettingsFontsize } from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import HTMLView from 'react-native-htmlview'
import { useSelector } from 'react-redux'

// Prevent going to the same hashtag multiple times
const renderNode = ({
  routeParams,
  theme,
  node,
  index,
  adaptedFontsize,
  adaptedLineheight,
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
  adaptedFontsize: number
  adaptedLineheight: number
  navigation: StackNavigationProp<Nav.TabLocalStackParamList>
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
              accessible
              key={index}
              style={{
                color: theme.blue,
                fontSize: adaptedFontsize,
                lineHeight: adaptedLineheight
              }}
              onPress={() => {
                analytics('status_hashtag_press')
                !disableDetails &&
                  differentTag &&
                  navigation.push('Tab-Shared-Hashtag', {
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
                color: accountIndex !== -1 ? theme.blue : theme.primaryDefault,
                fontSize: adaptedFontsize,
                lineHeight: adaptedLineheight
              }}
              onPress={() => {
                analytics('status_mention_press')
                accountIndex !== -1 &&
                  !disableDetails &&
                  differentAccount &&
                  navigation.push('Tab-Shared-Account', {
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
              alignItems: 'center',
              fontSize: adaptedFontsize,
              lineHeight: adaptedLineheight
            }}
            onPress={async () => {
              analytics('status_link_press')
              !disableDetails && !shouldBeTag
                ? await openLink(href, navigation)
                : navigation.push('Tab-Shared-Hashtag', {
                    hashtag: content.substring(1)
                  })
            }}
          >
            {content || (showFullLink ? href : domain[1])}
            {!shouldBeTag ? (
              <Icon
                color={theme.blue}
                name='ExternalLink'
                size={adaptedFontsize}
                style={{
                  transform: [{ translateY: -2 }]
                }}
              />
            ) : null}
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
  size?: 'S' | 'M' | 'L'
  adaptiveSize?: boolean
  emojis?: Mastodon.Emoji[]
  mentions?: Mastodon.Mention[]
  tags?: Mastodon.Tag[]
  showFullLink?: boolean
  numberOfLines?: number
  expandHint?: string
  disableDetails?: boolean
}

const ParseHTML = React.memo(
  ({
    content,
    size = 'M',
    adaptiveSize = false,
    emojis,
    mentions,
    tags,
    showFullLink = false,
    numberOfLines = 10,
    expandHint,
    disableDetails = false
  }: Props) => {
    const adaptiveFontsize = useSelector(getSettingsFontsize)
    const adaptedFontsize = adaptiveScale(
      StyleConstants.Font.Size[size],
      adaptiveSize ? adaptiveFontsize : 0
    )
    const adaptedLineheight = adaptiveScale(
      StyleConstants.Font.LineHeight[size],
      adaptiveSize ? adaptiveFontsize : 0
    )

    const navigation = useNavigation<
      StackNavigationProp<Nav.TabLocalStackParamList>
    >()
    const route = useRoute()
    const { mode, theme } = useTheme()
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
          adaptedFontsize,
          adaptedLineheight,
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
            adaptiveSize={adaptiveSize}
          />
        )
      } else {
        return null
      }
    }, [])
    const rootComponent = useCallback(
      ({ children }) => {
        const { t } = useTranslation('componentParse')

        const [expandAllow, setExpandAllow] = useState(false)
        const [expanded, setExpanded] = useState(false)

        const onTextLayout = useCallback(({ nativeEvent }) => {
          if (nativeEvent.lines.length >= numberOfLines + 5) {
            setExpandAllow(true)
          }
        }, [])

        return (
          <View style={{ overflow: 'hidden' }}>
            <Text
              children={children}
              onTextLayout={onTextLayout}
              numberOfLines={
                expandAllow ? (expanded ? 999 : numberOfLines) : undefined
              }
            />
            {expandAllow ? (
              <Pressable
                accessibilityLabel=''
                onPress={() => {
                  analytics('status_readmore', { allow: expandAllow, expanded })
                  layoutAnimation()
                  setExpanded(!expanded)
                }}
                style={{
                  justifyContent: 'center',
                  marginTop: expanded ? 0 : -adaptedLineheight,
                  minHeight: 44,
                  backgroundColor: theme.backgroundDefault
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    ...StyleConstants.FontStyle.S,
                    color: theme.primaryDefault
                  }}
                  children={t(`HTML.expanded.${expanded.toString()}`, {
                    hint: expandHint
                  })}
                />
              </Pressable>
            ) : null}
          </View>
        )
      },
      [mode, i18n.language]
    )

    return (
      <HTMLView
        value={content}
        TextComponent={textComponent}
        RootComponent={rootComponent}
        renderNode={renderNodeCallback}
      />
    )
  },
  () => true
)

export default ParseHTML
