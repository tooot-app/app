import { HeaderLeft } from '@components/Header'
import Icon from '@components/Icon'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import TimelineDefault from '@components/Timeline/Default'
import { useQuery } from '@tanstack/react-query'
import apiGeneral from '@utils/api/general'
import apiInstance from '@utils/api/instance'
import { urlMatcher } from '@utils/helpers/urlMatcher'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { queryClient } from '@utils/queryHooks'
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
    params: { toot }
  }
}) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['componentTimeline', 'screenTabs'])

  const [hasRemoteContent, setHasRemoteContent] = useState<boolean>(false)
  const queryKey: { local: QueryKeyTimeline; remote: QueryKeyTimeline } = {
    local: ['Timeline', { page: 'Toot', toot: toot.id, remote: false }],
    remote: ['Timeline', { page: 'Toot', toot: toot.id, remote: true }]
  }

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
    navigation.setParams({ toot, queryKey: queryKey.local })
  }, [hasRemoteContent])

  const flRef = useRef<FlatList>(null)
  const scrolled = useRef(false)

  const match = urlMatcher(toot.url || toot.uri)
  const highlightIndex = useRef<number>(0)
  const query = useQuery<{ pages: { body: Mastodon.Status[] }[] }>(
    queryKey.local,
    async () => {
      const context = await apiInstance<{
        ancestors: Mastodon.Status[]
        descendants: Mastodon.Status[]
      }>({
        method: 'get',
        url: `statuses/${toot.id}/context`
      }).then(res => res.body)

      highlightIndex.current = context.ancestors.length

      const statuses = [...context.ancestors, { ...toot }, ...context.descendants]

      return {
        pages: [
          {
            body: statuses.map((status, index) => {
              if (index < highlightIndex.current || status.id === toot.id) {
                status._level = 0
                return status
              } else {
                const repliedLevel: number =
                  statuses.find(s => s.id === status.in_reply_to_id)?._level || 0
                status._level = repliedLevel + 1
                return status
              }
            })
          }
        ]
      }
    },
    {
      placeholderData: { pages: [{ body: [toot] }] },
      enabled: !toot._remote,
      staleTime: 0,
      refetchOnMount: true,
      onSuccess: data => {
        if (data.pages[0].body.length < 1) {
          navigation.goBack()
          return
        }

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
  )
  useQuery<Mastodon.Status[]>(
    queryKey.remote,
    async () => {
      const domain = match?.domain
      if (!domain?.length) {
        return Promise.reject('Cannot parse remote doamin')
      }
      const id = match?.status?.id
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

      if (!context?.ancestors.length && !context?.descendants.length) {
        return Promise.resolve([])
      }

      highlightIndex.current = context.ancestors.length

      const statuses = [...context.ancestors, { ...toot }, ...context.descendants]

      return statuses.map((status, index) => {
        if (index < highlightIndex.current || status.id === toot.id) {
          status._level = 0
          return status
        }

        const repliedLevel: number = statuses.find(s => s.id === status.in_reply_to_id)?._level || 0
        status._level = repliedLevel + 1
        return status
      })
    },
    {
      enabled:
        query.isFetched &&
        ['public', 'unlisted'].includes(toot.visibility) &&
        match?.domain !== getAccountStorage.string('auth.domain'),
      staleTime: 0,
      refetchOnMount: true,
      onSuccess: data => {
        if ((query.data?.pages[0].body.length || 0) < 1 && data.length < 1) {
          navigation.goBack()
          return
        }

        if ((query.data?.pages[0].body.length || 0) < data.length) {
          queryClient.cancelQueries(queryKey.local)
          queryClient.setQueryData<{
            pages: { body: Mastodon.Status[] }[]
          }>(queryKey.local, old => {
            if (!old) return old

            setHasRemoteContent(true)
            return {
              pages: [
                {
                  body: data.map(remote => {
                    const localMatch = query.data?.pages[0].body.find(
                      local => local.uri === remote.uri
                    )
                    if (localMatch) {
                      return { ...localMatch, _level: remote._level }
                    } else {
                      return {
                        ...remote,
                        _remote: true,
                        account: { ...remote.account, _remote: true },
                        mentions: remote.mentions.map(mention => ({ ...mention, _remote: true })),
                        ...(remote.reblog && {
                          reblog: {
                            ...remote.reblog,
                            _remote: true,
                            account: { ...remote.reblog.account, _remote: true },
                            mentions: remote.reblog.mentions.map(mention => ({
                              ...mention,
                              _remote: true
                            }))
                          }
                        })
                      }
                    }
                  })
                }
              ]
            }
          })
        }

        scrolled.current = true
        const pointer = data.findIndex(({ id }) => id === toot.id)
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
      data={query.data?.pages?.[0].body}
      renderItem={({ item, index }) => {
        const prev = query.data?.pages[0].body[index - 1]?._level || 0
        const curr = item._level
        const next = query.data?.pages[0].body[index + 1]?._level || 0

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
              children={query.data?.pages[0].body[index - 1]?._level}
              style={{ position: 'absolute', top: 4, left: 4, color: colors.red }}
            />
            <CustomText
              children={item._level}
              style={{ position: 'absolute', top: 20, left: 4, color: colors.yellow }}
            />
            <CustomText
              children={query.data?.pages[0].body[index + 1]?._level}
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
          error.index < (query.data?.pages[0].body.length || 0) &&
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
          {query.isFetching ? (
            <Circle size={StyleConstants.Font.Size.L} color={colors.secondary} />
          ) : null}
        </View>
      }
    />
  )
}

export default TabSharedToot
