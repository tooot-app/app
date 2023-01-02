import { HeaderLeft } from '@components/Header'
import Icon from '@components/Icon'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import TimelineDefault from '@components/Timeline/Default'
import { useQuery } from '@tanstack/react-query'
import apiGeneral from '@utils/api/general'
import apiInstance from '@utils/api/instance'
import { getHost } from '@utils/helpers/urlMatcher'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, FlatList, Pressable, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import { Path, Svg } from 'react-native-svg'

const TabSharedToot: React.FC<TabSharedStackScreenProps<'Tab-Shared-Toot'>> = ({
  navigation,
  route: {
    params: { toot, rootQueryKey }
  }
}) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['componentTimeline', 'screenTabs'])

  const [hasRemoteContent, setHasRemoteContent] = useState<boolean>(false)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center' }}
          disabled={!hasRemoteContent}
          onPress={() =>
            Alert.alert(
              t('screenTabs:shared.toot.remoteFetch.title'),
              t('screenTabs:shared.toot.remoteFetch.message')
            )
          }
        >
          {hasRemoteContent ? (
            <Icon
              name='Wifi'
              size={StyleConstants.Font.Size.M}
              color={colors.primaryDefault}
              style={{ marginRight: StyleConstants.Spacing.S }}
            />
          ) : null}
          <CustomText
            style={{ color: colors.primaryDefault }}
            fontSize='L'
            fontWeight='Bold'
            numberOfLines={1}
            children={t('screenTabs:shared.toot.name')}
          />
        </Pressable>
      ),
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
    })
  }, [hasRemoteContent])

  const flRef = useRef<FlatList>(null)
  const scrolled = useRef(false)

  const finalData = useRef<(Mastodon.Status & { key?: string })[]>([
    { ...toot, _level: 0, key: 'cached' }
  ])
  const highlightIndex = useRef<number>(0)
  const queryKey: { local: QueryKeyTimeline; remote: QueryKeyTimeline } = {
    local: ['Timeline', { page: 'Toot', toot: toot.id, remote: false }],
    remote: ['Timeline', { page: 'Toot', toot: toot.id, remote: true }]
  }
  const queryLocal = useQuery(
    queryKey.local,
    async () => {
      const context = await apiInstance<{
        ancestors: Mastodon.Status[]
        descendants: Mastodon.Status[]
      }>({
        method: 'get',
        url: `statuses/${toot.id}/context`
      })

      const statuses: (Mastodon.Status & { _level?: number })[] = [
        ...context.body.ancestors,
        { ...toot },
        ...context.body.descendants
      ]

      const highlight = context.body.ancestors.length
      highlightIndex.current = highlight

      for (const [index, status] of statuses.entries()) {
        if (index < highlight || status.id === toot.id) {
          statuses[index]._level = 0
          continue
        }

        const repliedLevel = statuses.find(s => s.id === status.in_reply_to_id)?._level
        statuses[index]._level = (repliedLevel || 0) + 1
      }

      return { pages: [{ body: statuses }] }
    },
    {
      enabled: !toot._remote,
      staleTime: 0,
      refetchOnMount: true,
      onSuccess: data => {
        if (data.pages[0].body.length < 1) {
          navigation.goBack()
          return
        }

        if (finalData.current[0].key === 'cached') {
          finalData.current = data.pages[0].body

          if (!scrolled.current) {
            scrolled.current = true
            const pointer = data.pages[0].body.findIndex(({ id }) => id === toot.id)
            if (pointer < 1) return
            const length = flRef.current?.props.data?.length
            if (!length) return
            try {
              setTimeout(() => {
                try {
                  flRef.current?.scrollToIndex({
                    index: pointer,
                    viewOffset: 100
                  })
                } catch {}
              }, 500)
            } catch (error) {
              return
            }
          }
        }
      }
    }
  )
  useQuery(
    queryKey.remote,
    async () => {
      const domain = getHost(toot.url || toot.uri)
      if (!domain?.length) {
        return Promise.reject('Cannot parse remote doamin')
      }
      const id = (toot.url || toot.uri).match(new RegExp(/\/([0-9]+)$/))?.[1]
      if (!id?.length) {
        return Promise.reject('Cannot parse remote toot id')
      }

      const context = await apiGeneral<{
        ancestors: Mastodon.Status[]
        descendants: Mastodon.Status[]
      }>({
        method: 'get',
        domain,
        url: `api/v1/statuses/${id}/context`
      }).then(res => res.body)

      if (!context) {
        return Promise.reject('Cannot retrieve remote context')
      }

      const statuses: (Mastodon.Status & { _level?: number })[] = [
        ...context.ancestors,
        { ...toot },
        ...context.descendants
      ]

      const highlight = context.ancestors.length
      highlightIndex.current = highlight

      for (const [index, status] of statuses.entries()) {
        if (index < highlight || status.id === toot.id) {
          statuses[index]._level = 0
          continue
        }

        const repliedLevel = statuses.find(s => s.id === status.in_reply_to_id)?._level
        statuses[index]._level = (repliedLevel || 0) + 1
      }

      return { pages: [{ body: statuses }] }
    },
    {
      enabled:
        ['public', 'unlisted'].includes(toot.visibility) &&
        getHost(toot.uri) !== getAccountStorage.string('auth.domain'),
      staleTime: 0,
      refetchOnMount: true,
      onSuccess: data => {
        if (finalData.current.length < 1 && data.pages[0].body.length < 1) {
          navigation.goBack()
          return
        }

        if (finalData.current.length < data.pages[0].body.length) {
          finalData.current = data.pages[0].body.map(remote => {
            const localMatch = finalData.current.find(local => local.uri === remote.uri)
            if (localMatch) {
              delete localMatch.key
              return localMatch
            } else {
              remote._remote = true

              remote.account._remote = true
              remote.mentions = remote.mentions.map(mention => ({ ...mention, _remote: true }))
              if (remote.reblog) {
                remote.reblog.account._remote = true
                remote.reblog.mentions = remote.mentions.map(mention => ({
                  ...mention,
                  _remote: true
                }))
              }

              return remote
            }
          })

          setHasRemoteContent(true)
        }

        scrolled.current = true
        const pointer = data.pages[0].body.findIndex(({ id }) => id === toot.id)
        if (pointer < 1) return
        const length = flRef.current?.props.data?.length
        if (!length) return
        try {
          setTimeout(() => {
            try {
              flRef.current?.scrollToIndex({
                index: pointer,
                viewOffset: 100
              })
            } catch {}
          }, 500)
        } catch (error) {
          return
        }
      }
    }
  )

  const heights = useRef<(number | undefined)[]>([])
  const MAX_LEVEL = 10
  const ARC = StyleConstants.Avatar.XS / 4

  return (
    <FlatList
      ref={flRef}
      scrollEventThrottle={16}
      windowSize={7}
      data={finalData.current}
      renderItem={({ item, index }) => {
        const prev = finalData.current[index - 1]?._level || 0
        const curr = item._level
        const next = finalData.current[index + 1]?._level || 0

        return (
          <View
            style={{
              paddingLeft:
                index > highlightIndex.current
                  ? Math.min(item._level - 1, MAX_LEVEL) * StyleConstants.Spacing.S
                  : undefined
            }}
            onLayout={({
              nativeEvent: {
                layout: { height }
              }
            }) => (heights.current[index] = height)}
          >
            <TimelineDefault
              item={item}
              queryKey={item._remote ? queryKey.remote : queryKey.local}
              rootQueryKey={rootQueryKey}
              highlighted={toot.id === item.id || item.id === 'cached'}
              isConversation={toot.id !== item.id && item.id !== 'cached'}
            />
            {curr > 1 || next > 1
              ? [...new Array(curr)].map((_, i) => {
                  if (i > MAX_LEVEL) return null

                  const lastLine = curr === i + 1
                  if (lastLine) {
                    if (curr === prev + 1 || curr === next - 1) {
                      if (curr > next) {
                        return null
                      }
                      return (
                        <Svg key={i} style={{ position: 'absolute' }}>
                          <Path
                            d={
                              `M ${curr * StyleConstants.Spacing.S + ARC} ${
                                StyleConstants.Spacing.M + StyleConstants.Avatar.XS / 2
                              } ` +
                              `a ${ARC} ${ARC} 0 0 0 -${ARC} ${ARC} ` +
                              `v 999`
                            }
                            strokeWidth={1}
                            stroke={colors.border}
                            strokeOpacity={0.6}
                          />
                        </Svg>
                      )
                    } else {
                      if (i >= curr - 2) return null
                      return (
                        <Svg key={i} style={{ position: 'absolute' }}>
                          <Path
                            d={
                              `M ${(i + 1) * StyleConstants.Spacing.S} 0 ` +
                              `v ${
                                (heights.current[index] || 999) -
                                (StyleConstants.Spacing.S * 1.5 + StyleConstants.Font.Size.L) / 2 -
                                StyleConstants.Avatar.XS / 2
                              } ` +
                              `a ${ARC} ${ARC} 0 0 0 ${ARC} ${ARC}`
                            }
                            strokeWidth={1}
                            stroke={colors.border}
                            strokeOpacity={0.6}
                          />
                        </Svg>
                      )
                    }
                  } else {
                    if (i >= next - 1) {
                      return (
                        <Svg key={i} style={{ position: 'absolute' }}>
                          <Path
                            d={
                              `M ${(i + 1) * StyleConstants.Spacing.S} 0 ` +
                              `v ${
                                (heights.current[index] || 999) -
                                (StyleConstants.Spacing.S * 1.5 +
                                  StyleConstants.Font.Size.L * 1.35) /
                                  2
                              } ` +
                              `h ${ARC}`
                            }
                            strokeWidth={1}
                            stroke={colors.border}
                            strokeOpacity={0.6}
                          />
                        </Svg>
                      )
                    } else {
                      return (
                        <Svg key={i} style={{ position: 'absolute' }}>
                          <Path
                            d={`M ${(i + 1) * StyleConstants.Spacing.S} 0 ` + `v 999`}
                            strokeWidth={1}
                            stroke={colors.border}
                            strokeOpacity={0.6}
                          />
                        </Svg>
                      )
                    }
                  }
                })
              : null}
            {/* <CustomText
              children={data?.body[index - 1]?._level}
              style={{ position: 'absolute', top: 4, left: 4, color: colors.red }}
            />
            <CustomText
              children={item._level}
              style={{ position: 'absolute', top: 20, left: 4, color: colors.yellow }}
            />
            <CustomText
              children={data?.body[index + 1]?._level}
              style={{ position: 'absolute', top: 36, left: 4, color: colors.green }}
            /> */}
          </View>
        )
      }}
      initialNumToRender={6}
      maxToRenderPerBatch={3}
      ItemSeparatorComponent={({ leadingItem }) => {
        return (
          <>
            <ComponentSeparator
              extraMarginLeft={
                leadingItem.id === toot.id
                  ? 0
                  : StyleConstants.Avatar.XS +
                    StyleConstants.Spacing.S +
                    Math.min(Math.max(0, leadingItem._level - 1), MAX_LEVEL) *
                      StyleConstants.Spacing.S
              }
            />
            {leadingItem._level > 1
              ? [...new Array(leadingItem._level - 1)].map((_, i) => (
                  <Svg key={i} style={{ position: 'absolute', top: -1 }}>
                    <Path
                      d={`M ${(i + 1) * StyleConstants.Spacing.S} 0 ` + `v 1`}
                      strokeWidth={1}
                      stroke={colors.border}
                      strokeOpacity={0.6}
                    />
                  </Svg>
                ))
              : null}
          </>
        )
      }}
      onScrollToIndexFailed={error => {
        const offset = error.averageItemLength * error.index
        flRef.current?.scrollToOffset({ offset })
        try {
          error.index < finalData.current.length &&
            setTimeout(
              () =>
                flRef.current?.scrollToIndex({
                  index: error.index,
                  viewOffset: 100
                }),
              500
            )
        } catch {}
      }}
      ListFooterComponent={
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: colors.backgroundDefault,
            marginHorizontal: StyleConstants.Spacing.M
          }}
        >
          {queryLocal.isFetching ? (
            <Circle size={StyleConstants.Font.Size.L} color={colors.secondary} />
          ) : null}
        </View>
      }
    />
  )
}

export default TabSharedToot
