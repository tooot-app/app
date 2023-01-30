import Icon from '@components/Icon'
import openLink from '@components/openLink'
import ParseEmojis from '@components/Parse/Emojis'
import StatusContext from '@components/Timeline/Shared/Context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { urlMatcher } from '@utils/helpers/urlMatcher'
import { TabLocalStackParamList, TabSharedStackParamList } from '@utils/navigation/navigators'
import { useAccountStorage, useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import { ChildNode } from 'domhandler'
import { ElementType, parseDocument } from 'htmlparser2'
import i18next from 'i18next'
import React, { useContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ColorValue, Platform, Pressable, Text, View } from 'react-native'

export interface Props {
  content: string
  size?: 'S' | 'M' | 'L'
  color?: ColorValue
  adaptiveSize?: boolean
  showFullLink?: boolean
  numberOfLines?: number
  expandHint?: string
  selectable?: boolean
  setSpoilerExpanded?: React.Dispatch<React.SetStateAction<boolean>>
  emojis?: Mastodon.Emoji[]
  mentions?: Mastodon.Mention[]
}

const ParseHTML: React.FC<Props> = ({
  content,
  size = 'M',
  color,
  adaptiveSize = false,
  showFullLink = false,
  numberOfLines = 10,
  expandHint,
  selectable = false,
  setSpoilerExpanded,
  emojis,
  mentions
}) => {
  const { status, highlighted, disableDetails, excludeMentions } = useContext(StatusContext)

  const [adaptiveFontsize] = useGlobalStorage.number('app.font_size')
  const adaptedFontsize = adaptiveScale(
    StyleConstants.Font.Size[size],
    adaptiveSize ? adaptiveFontsize : 0
  )
  const adaptedLineheight =
    Platform.OS === 'ios'
      ? adaptiveScale(StyleConstants.Font.LineHeight[size], adaptiveSize ? adaptiveFontsize : 0)
      : undefined

  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()
  const { params } = useRoute()
  const { colors } = useTheme()
  const colorPrimary = color || colors.primaryDefault
  const { t } = useTranslation('componentParse')
  if (!expandHint) {
    expandHint = t('HTML.defaultHint')
  }

  if (disableDetails) {
    numberOfLines = 4
  }

  const [followedTags] = useAccountStorage.object('followed_tags')

  const MAX_ALLOWED_LINES = 35
  const [totalLines, setTotalLines] = useState<number>()
  const [expanded, setExpanded] = useState(highlighted)

  const document = parseDocument(content)
  const unwrapNode = (node: ChildNode): string => {
    switch (node.type) {
      case ElementType.Text:
        return node.data
      case ElementType.Tag:
        if (node.name === 'span') {
          if (node.attribs.class?.includes('invisible') && !showFullLink) return ''
          if (node.attribs.class?.includes('ellipsis') && !showFullLink)
            return node.children.map(child => unwrapNode(child)).join('') + '...'
        }
        return node.children.map(child => unwrapNode(child)).join('')
      default:
        return ''
    }
  }
  const prevMentionRemoved = useRef<boolean>(false)
  const renderNode = (node: ChildNode, index: number) => {
    switch (node.type) {
      case ElementType.Text:
        let content: string = node.data
        if (prevMentionRemoved.current) {
          prevMentionRemoved.current = false // Removing empty spaces appeared between tags and mentions
          if (node.data.trim().length) {
            content = excludeMentions?.current.length
              ? node.data.replace(new RegExp(/^\s+/), '')
              : node.data
          } else {
            content = node.data.trim()
          }
        }

        return (
          <ParseEmojis
            key={index}
            content={content}
            emojis={status?.emojis || emojis}
            size={size}
            color={colorPrimary}
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
                const children = node.children.map(unwrapNode).join('')
                const tag =
                  href.match(new RegExp(/\/tags?\/(.*)/, 'i'))?.[1]?.toLowerCase() ||
                  children.match(new RegExp(/#(\S+)/))?.[1]?.toLowerCase()

                const paramsHashtag = (params as { hashtag: Mastodon.Tag['name'] } | undefined)
                  ?.hashtag
                const sameHashtag = paramsHashtag === tag
                const isFollowing = followedTags?.find(t => t.name === tag)
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
                      navigation.push('Tab-Shared-Hashtag', { tag_name: tag })
                    }
                    children={children}
                  />
                )
              }
              if (classes.includes('mention') && (status?.mentions?.length || mentions?.length)) {
                let matchedMention:
                  | TabSharedStackParamList['Tab-Shared-Account']['account']
                  | undefined = (status?.mentions || mentions || []).find(
                  mention => mention.url === href
                )
                if (
                  matchedMention &&
                  excludeMentions?.current.find(eM => eM.id === matchedMention?.id)
                ) {
                  prevMentionRemoved.current = true
                  return null
                }

                if (!matchedMention) {
                  const match = urlMatcher(href)
                  if (match?.account?.acct) {
                    // @ts-ignore
                    matchedMention = { ...match.account, url: href }
                  }
                }

                const paramsAccount = (params as { account: Mastodon.Account } | undefined)?.account
                const sameAccount = paramsAccount ? paramsAccount.id === matchedMention?.id : false

                return (
                  <Text
                    key={index}
                    style={{ color: matchedMention ? colors.blue : colorPrimary }}
                    onPress={() =>
                      matchedMention &&
                      !disableDetails &&
                      !sameAccount &&
                      navigation.push('Tab-Shared-Account', { account: matchedMention })
                    }
                    children={node.children.map(unwrapNode).join('')}
                  />
                )
              }
            }

            const content = node.children.map(child => unwrapNode(child)).join('')
            const shouldBeTag = status?.tags?.find(tag => `#${tag.name}` === content)
            return (
              <Text
                key={index}
                style={{ color: colors.blue }}
                onPress={async () => {
                  if (!disableDetails) {
                    if (shouldBeTag) {
                      navigation.push('Tab-Shared-Hashtag', { tag_name: content.substring(1) })
                    } else {
                      await openLink(href, navigation)
                    }
                  }
                }}
                children={content}
              />
            )
            break
          case 'br':
            return (
              <Text
                key={index}
                style={{ lineHeight: adaptedLineheight ? adaptedLineheight / 2 : undefined }}
              >
                {'\n'}
              </Text>
            )
          case 'p':
            if (index < document.children.length - 1) {
              return (
                <Text key={index}>
                  {node.children.map((c, i) => renderNode(c, i))}
                  <Text
                    style={{ lineHeight: adaptedLineheight ? adaptedLineheight / 2 : undefined }}
                  >
                    {'\n\n'}
                  </Text>
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
                  ? t('HTML.moreLines', {
                      count:
                        totalLines === MAX_ALLOWED_LINES
                          ? (`${totalLines - numberOfLines}+` as unknown as number)
                          : totalLines - numberOfLines
                    })
                  : ''
            })}
          />
          <Icon
            name={expanded ? 'minimize-2' : 'maximize-2'}
            color={colors.primaryDefault}
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
          ...(Platform.OS === 'ios' &&
            status?.language &&
            i18next.dir(status.language) === 'rtl' &&
            ({ writingDirection: 'rtl' } as { writingDirection: 'rtl' })),
          height: numberOfLines === 1 && !expanded ? 0 : undefined
        }}
        numberOfLines={
          typeof totalLines === 'number'
            ? expanded
              ? 999
              : numberOfLines
            : Math.max(MAX_ALLOWED_LINES, numberOfLines)
        }
        selectable={selectable}
      />
    </View>
  )
}

export default ParseHTML
