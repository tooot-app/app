import Icon from '@components/Icon'
import openLink from '@components/openLink'
import ParseEmojis from '@components/Parse/Emojis'
import { useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { useFollowedTagsQuery } from '@utils/queryHooks/tags'
import { useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import { ChildNode } from 'domhandler'
import { ElementType, parseDocument } from 'htmlparser2'
import { isEqual } from 'lodash'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, TextStyleIOS, View } from 'react-native'

export interface Props {
  content: string
  size?: 'S' | 'M' | 'L'
  textStyles?: TextStyleIOS
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

const ParseHTML: React.FC<Props> = ({
  content,
  size = 'M',
  textStyles,
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
}) => {
  const [adaptiveFontsize] = useGlobalStorage.number('app.font_size')
  const adaptedFontsize = adaptiveScale(
    StyleConstants.Font.Size[size],
    adaptiveSize ? adaptiveFontsize : 0
  )
  const adaptedLineheight = adaptiveScale(
    StyleConstants.Font.LineHeight[size],
    adaptiveSize ? adaptiveFontsize : 0
  )

  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()
  const { params } = useRoute()
  const { colors } = useTheme()
  const { t } = useTranslation('componentParse')
  if (!expandHint) {
    expandHint = t('HTML.defaultHint')
  }

  if (disableDetails) {
    numberOfLines = 4
  }

  const followedTags = useFollowedTagsQuery()

  const [totalLines, setTotalLines] = useState<number>()
  const [expanded, setExpanded] = useState(highlighted)

  const document = parseDocument(content)
  const unwrapNode = (node: ChildNode): string => {
    switch (node.type) {
      case ElementType.Text:
        return node.data
      case ElementType.Tag:
        if (node.name === 'span') {
          if (node.attribs.class?.includes('invisible')) return ''
          if (node.attribs.class?.includes('ellipsis'))
            return node.children.map(child => unwrapNode(child)).join('') + '...'
        }
        return node.children.map(child => unwrapNode(child)).join('')
      default:
        return ''
    }
  }
  const renderNode = (node: ChildNode, index: number) => {
    switch (node.type) {
      case ElementType.Text:
        return (
          <ParseEmojis
            key={index}
            content={node.data}
            emojis={emojis}
            size={size}
            adaptiveSize={adaptiveSize}
          />
        )
      case ElementType.Tag:
        switch (node.name) {
          case 'a':
            const classes = node.attribs.class
            const href = node.attribs.href
            if (classes) {
              if (classes.includes('hashtag')) {
                const tag = href.match(new RegExp(/\/tags?\/(.*)/, 'i'))?.[1]
                const paramsHashtag = (params as { hashtag: Mastodon.Tag['name'] } | undefined)
                  ?.hashtag
                const sameHashtag = paramsHashtag === tag
                const isFollowing = followedTags.data?.pages[0]?.body.find(t => t.name === tag)
                return (
                  <Text
                    key={index}
                    style={[
                      { color: tag?.length ? colors.blue : colors.red },
                      isFollowing
                        ? {
                            textDecorationColor: tag?.length ? colors.blue : colors.red,
                            textDecorationLine: 'underline',
                            textDecorationStyle: 'dotted'
                          }
                        : null
                    ]}
                    onPress={() =>
                      tag?.length &&
                      !disableDetails &&
                      !sameHashtag &&
                      navigation.push('Tab-Shared-Hashtag', { hashtag: tag })
                    }
                    children={node.children.map(unwrapNode).join('')}
                  />
                )
              }
              if (classes.includes('mention') && mentions?.length) {
                const mentionIndex = mentions.findIndex(mention => mention.url === href)
                const paramsAccount = (params as { account: Mastodon.Account } | undefined)?.account
                const sameAccount = paramsAccount?.id === mentions[mentionIndex]?.id
                return (
                  <Text
                    key={index}
                    style={{ color: mentionIndex > -1 ? colors.blue : undefined }}
                    onPress={() =>
                      mentionIndex > -1 &&
                      !disableDetails &&
                      !sameAccount &&
                      navigation.push('Tab-Shared-Account', { account: mentions[mentionIndex] })
                    }
                    children={node.children.map(unwrapNode).join('')}
                  />
                )
              }
            }

            const content = node.children.map(child => unwrapNode(child)).join('')
            const shouldBeTag = tags && tags.find(tag => `#${tag.name}` === content)
            return (
              <Text
                key={index}
                style={{ color: colors.blue }}
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
                children={content !== href ? content : showFullLink ? href : content}
              />
            )
            break
          case 'p':
            if (index < document.children.length - 1) {
              return (
                <Text key={index}>
                  {node.children.map((c, i) => renderNode(c, i))}
                  <Text style={{ lineHeight: adaptedLineheight / 2 }}>{'\n\n'}</Text>
                </Text>
              )
            } else {
              return <Text key={index} children={node.children.map((c, i) => renderNode(c, i))} />
            }
          default:
            return <Text key={index} children={node.children.map((c, i) => renderNode(c, i))} />
        }
    }
    return null
  }
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
          <Text
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
      <Text
        children={document.children.map(renderNode)}
        onTextLayout={({ nativeEvent }) => {
          if (numberOfLines === 1 || nativeEvent.lines.length >= numberOfLines + 5) {
            setTotalLines(nativeEvent.lines.length)
          }
        }}
        style={{
          fontSize: adaptedFontsize,
          lineHeight: adaptedLineheight,
          ...textStyles,
          height: numberOfLines === 1 && !expanded ? 0 : undefined
        }}
        numberOfLines={
          typeof totalLines === 'number' ? (expanded ? 999 : numberOfLines) : undefined
        }
        selectable={selectable}
      />
    </View>
  )
}

export default ParseHTML
