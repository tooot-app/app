import Icon from '@components/Icon'
import openLink from '@components/openLink'
import ParseEmojis from '@components/Parse/Emojis'
import CustomText from '@components/Text'
import { useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { getSettingsFontsize } from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import { isEqual } from 'lodash'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import HTMLView from 'react-native-htmlview'
import { useSelector } from 'react-redux'

// Prevent going to the same hashtag multiple times
const renderNode = ({
  routeParams,
  colors,
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
  colors: any
  node: any
  index: number
  adaptedFontsize: number
  adaptedLineheight: number
  navigation: StackNavigationProp<TabLocalStackParamList>
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
          const tag = href?.split(new RegExp(/\/tag\/(.*)|\/tags\/(.*)/))
          const differentTag = routeParams?.hashtag
            ? routeParams.hashtag !== tag[1] && routeParams.hashtag !== tag[2]
            : true
          return (
            <CustomText
              accessible
              key={index}
              style={{
                color: colors.blue,
                fontSize: adaptedFontsize,
                lineHeight: adaptedLineheight
              }}
              onPress={() => {
                !disableDetails &&
                  differentTag &&
                  navigation.push('Tab-Shared-Hashtag', {
                    hashtag: tag[1] || tag[2]
                  })
              }}
            >
              {node.children[0].data}
              {node.children[1]?.children[0].data}
            </CustomText>
          )
        } else if (classes.includes('mention') && mentions) {
          const accountIndex = mentions.findIndex(mention => mention.url === href)
          const differentAccount = routeParams?.account
            ? routeParams.account.id !== mentions[accountIndex]?.id
            : true
          return (
            <CustomText
              key={index}
              style={{
                color: accountIndex !== -1 ? colors.blue : colors.primaryDefault,
                fontSize: adaptedFontsize,
                lineHeight: adaptedLineheight
              }}
              onPress={() => {
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
            </CustomText>
          )
        }
      } else {
        const domain = href?.split(new RegExp(/:\/\/(.[^\/]+)/))
        // Need example here
        const content = node.children && node.children[0] && node.children[0].data
        const shouldBeTag = tags && tags.filter(tag => `#${tag.name}` === content).length > 0
        return (
          <CustomText
            key={index}
            style={{
              color: colors.blue,
              alignItems: 'center',
              fontSize: adaptedFontsize,
              lineHeight: adaptedLineheight
            }}
            onPress={async () => {
              if (!disableDetails) {
                if (shouldBeTag) {
                  navigation.push('Tab-Shared-Hashtag', {
                    hashtag: content.substring(1)
                  })
                } else {
                  await openLink(href, navigation)
                }
              }
            }}
          >
            {content && content !== href ? content : showFullLink ? href : domain?.[1]}
            {!shouldBeTag ? (
              <Icon
                color={colors.blue}
                name='ExternalLink'
                size={adaptedFontsize}
                style={{
                  marginLeft: StyleConstants.Spacing.XS,
                  ...(Platform.OS === 'android' && { transform: [{ translateY: 2 }] })
                }}
              />
            ) : null}
          </CustomText>
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
  highlighted?: boolean
  disableDetails?: boolean
  selectable?: boolean
  setSpoilerExpanded?: React.Dispatch<React.SetStateAction<boolean>>
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
    highlighted = false,
    disableDetails = false,
    selectable = false,
    setSpoilerExpanded
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

    const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()
    const route = useRoute()
    const { colors, theme } = useTheme()
    const { t } = useTranslation('componentParse')
    if (!expandHint) {
      expandHint = t('HTML.defaultHint')
    }

    if (disableDetails) {
      numberOfLines = 4
    }

    const renderNodeCallback = useCallback(
      (node: any, index: any) =>
        renderNode({
          routeParams: route.params,
          colors,
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
    const textComponent = useCallback(({ children }: any) => {
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
      ({ children }: any) => {
        const { t } = useTranslation('componentParse')

        const [totalLines, setTotalLines] = useState<number>()
        const [expanded, setExpanded] = useState(highlighted)

        return (
          <View style={{ overflow: 'hidden' }}>
            {(!disableDetails && typeof totalLines === 'number') || numberOfLines === 1 ? (
              <Pressable
                accessibilityLabel={t('HTML.accessibilityHint')}
                onPress={() => {
                  layoutAnimation()
                  setExpanded(!expanded)
                  if (setSpoilerExpanded) {
                    setSpoilerExpanded(!expanded)
                  }
                }}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 44,
                  backgroundColor: colors.backgroundDefault
                }}
              >
                <CustomText
                  style={{
                    textAlign: 'center',
                    ...StyleConstants.FontStyle.S,
                    color: colors.primaryDefault,
                    marginRight: StyleConstants.Spacing.S
                  }}
                  children={t('HTML.expanded', {
                    hint: expandHint,
                    moreLines:
                      numberOfLines > 1 && typeof totalLines === 'number'
                        ? t('HTML.moreLines', { count: totalLines - numberOfLines })
                        : ''
                  })}
                />
                <Icon
                  name={expanded ? 'Minimize2' : 'Maximize2'}
                  color={colors.primaryDefault}
                  strokeWidth={2}
                  size={StyleConstants.Font.Size[size]}
                />
              </Pressable>
            ) : null}
            <CustomText
              children={children}
              onTextLayout={({ nativeEvent }) => {
                if (numberOfLines === 1 || nativeEvent.lines.length >= numberOfLines + 5) {
                  setTotalLines(nativeEvent.lines.length)
                }
              }}
              style={{
                height: numberOfLines === 1 && !expanded ? 0 : undefined
              }}
              numberOfLines={
                typeof totalLines === 'number' ? (expanded ? 999 : numberOfLines) : undefined
              }
              selectable={selectable}
            />
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
  },
  (prev, next) => prev.content === next.content && isEqual(prev.emojis, next.emojis)
)

export default ParseHTML
