import { HeaderLeft } from '@components/Header'
import Icon from '@components/Icon'
import { Loading } from '@components/Loading'
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
import { Alert, FlatList, Platform, Pressable, View } from 'react-native'
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

  const flRef = useRef<FlatList<Mastodon.Status & { _level?: number; key?: string }>>(null)

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
              name='wifi'
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

  const PREV_PER_BATCH = 1
  const ancestorsCache = useRef<(Mastodon.Status & { _level?: number; key?: string })[]>()
  const loaded = useRef<boolean>(false)
  const prependContent = async () => {
    loaded.current = true

    if (ancestorsCache.current?.length) {
      switch (Platform.OS) {
        case 'ios':
          for (let [] of Array(
            Math.ceil(ancestorsCache.current.length / PREV_PER_BATCH)
          ).entries()) {
            await new Promise(promise => setTimeout(promise, 64))
            queryClient.setQueryData<{ pages: { body: Mastodon.Status[] }[] }>(
              queryKey.local,
              old => {
                const insert = ancestorsCache.current?.slice(-PREV_PER_BATCH)
                ancestorsCache.current = ancestorsCache.current?.slice(0, -PREV_PER_BATCH)
                if (insert) {
                  old?.pages[0].body.unshift(...insert)
                }

                return old
              }
            )
          }
          break
        default:
          queryClient.setQueryData<{ pages: { body: Mastodon.Status[] }[] }>(
            queryKey.local,
            old => {
              ancestorsCache.current && old?.pages[0].body.unshift(...ancestorsCache.current)

              return old
            }
          )

          setTimeout(() => {
            flRef.current?.scrollToIndex({
              index: ancestorsCache.current?.length || 0,
              viewOffset: 50
            })
          }, 50)
          break
      }
    }
  }

  const match = urlMatcher(toot.url || toot.uri)
  const remoteQueryEnabled =
    ['public', 'unlisted'].includes(toot.visibility) &&
    match?.domain !== getAccountStorage.string('auth.domain')
  const query = useQuery<{
    pages: { body: (Mastodon.Status & { _level?: number; key?: string })[] }[]
  }>(
    queryKey.local,
    async () => {
      const context = await apiInstance<{
        ancestors: Mastodon.Status[]
        descendants: Mastodon.Status[]
      }>({
        method: 'get',
        url: `statuses/${toot.id}/context`
      }).then(res => res.body)

      ancestorsCache.current = [...context.ancestors]
      const statuses = [{ ...toot }, ...context.descendants]

      return {
        pages: [
          {
            body: statuses.map((status, index) => {
              if (index === 0) {
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
      placeholderData: { pages: [{ body: [{ ...toot, _level: 0, key: `${toot.id}_cache` }] }] },
      enabled: !toot._remote,
      staleTime: 0,
      refetchOnMount: true,
      onSuccess: async data => {
        if (data.pages[0].body.length < 1) {
          navigation.goBack()
          return
        }

        if (!remoteQueryEnabled) {
          await prependContent()
        }
      }
    }
  )
  const remoteQuery = useQuery<Mastodon.Status[]>(
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
        return Promise.resolve([{ ...toot }])
      }

      if ((ancestorsCache.current?.length || 0) < context.ancestors.length) {
        ancestorsCache.current = context.ancestors.map(ancestor => {
          const localMatch = ancestorsCache.current?.find(local => local.uri === ancestor.uri)
          if (localMatch) {
            return localMatch
          } else {
            return {
              ...ancestor,
              _remote: true,
              account: { ...ancestor.account, _remote: true },
              mentions: ancestor.mentions.map(mention => ({
                ...mention,
                _remote: true
              })),
              ...(ancestor.reblog && {
                reblog: {
                  ...ancestor.reblog,
                  _remote: true,
                  account: { ...ancestor.reblog.account, _remote: true },
                  mentions: ancestor.reblog.mentions.map(mention => ({
                    ...mention,
                    _remote: true
                  }))
                }
              })
            }
          }
        })
      }

      const statuses = [{ ...toot }, ...context.descendants]
      return statuses.map((status, index) => {
        if (index === 0) {
          status._level = 0
          return status
        } else {
          const repliedLevel: number =
            statuses.find(s => s.id === status.in_reply_to_id)?._level || 0
          status._level = repliedLevel + 1
          return status
        }
      })
    },
    {
      enabled: (toot._remote ? true : query.isFetched) && remoteQueryEnabled,
      staleTime: 0,
      refetchOnMount: true,
      retry: false,
      onSuccess: async data => {
        if ((query.data?.pages[0].body.length || 0) < 1 && data.length < 1) {
          navigation.goBack()
          return
        }

        if ((query.data?.pages[0].body.length || 0) < data.length) {
          queryClient.cancelQueries(queryKey.local)
          queryClient.setQueryData<{ pages: { body: Mastodon.Status[] }[] }>(
            queryKey.local,
            old => {
              setHasRemoteContent(true)
              return {
                pages: [
                  {
                    body: data.map(remote => {
                      const localMatch = old?.pages[0].body.find(local => local.uri === remote.uri)
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
            }
          )
        }
      },
      onSettled: async () => {
        await prependContent()
      }
    }
  )

  const [heights, setHeights] = useState<{ [key: number]: number }>({})
  const MAX_LEVEL = 10
  const ARC = StyleConstants.Avatar.XS / 4

  return (
    <FlatList
      ref={flRef}
      windowSize={5}
      data={query.data?.pages?.[0].body}
      renderItem={({ item, index }) => {
        const prev = query.data?.pages[0].body[index - 1]?._level || 0
        const curr = item._level || 0
        const next = query.data?.pages[0].body[index + 1]?._level || 0

        return (
          <View
            style={{ paddingLeft: Math.min(curr - 1, MAX_LEVEL) * StyleConstants.Spacing.S }}
            onLayout={({
              nativeEvent: {
                layout: { height }
              }
            }) => setHeights({ ...heights, [index]: height })}
          >
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
                        <Svg key={i} style={{ position: 'absolute' }} fill='none'>
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
                        <Svg key={i} style={{ position: 'absolute' }} fill='none'>
                          <Path
                            d={
                              `M ${(i + 1) * StyleConstants.Spacing.S} 0 ` +
                              `v ${
                                (heights[index] || 999) -
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
                        <Svg key={i} style={{ position: 'absolute' }} fill='none'>
                          <Path
                            d={
                              `M ${(i + 1) * StyleConstants.Spacing.S} 0 ` +
                              `v ${
                                (heights[index] || 999) -
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
                        <Svg key={i} style={{ position: 'absolute' }} fill='none'>
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
            <TimelineDefault
              item={item}
              queryKey={item._remote ? queryKey.remote : queryKey.local}
              highlighted={toot.id === item.id || item.id === 'cached'}
              isConversation={toot.id !== item.id && item.id !== 'cached'}
              noBackground
            />
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
      initialNumToRender={3}
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
                    Math.min(Math.max(0, (leadingItem._level || 0) - 1), MAX_LEVEL) *
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
      ListFooterComponent={
        query.isFetching || remoteQuery.isFetching ? (
          <View style={{ flex: 1, alignItems: 'center' }} children={<Loading />} />
        ) : null
      }
      {...(loaded.current && { maintainVisibleContentPosition: { minIndexForVisible: 0 } })}
      {...(Platform.OS !== 'ios' && {
        onScrollToIndexFailed: error => {
          const offset = error.averageItemLength * error.index
          flRef.current?.scrollToOffset({ offset })
          error.index < (ancestorsCache.current?.length || 0) &&
            setTimeout(
              () =>
                flRef.current?.scrollToIndex({
                  index: error.index,
                  viewOffset: 50
                }),
              50
            )
        }
      })}
    />
  )
}

export default TabSharedToot
