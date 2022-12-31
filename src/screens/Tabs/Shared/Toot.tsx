import Button from '@components/Button'
import { HeaderLeft } from '@components/Header'
import Icon from '@components/Icon'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import TimelineDefault from '@components/Timeline/Default'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline, useTootQuery } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'
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

  useEffect(() => {
    navigation.setOptions({
      title: t('screenTabs:shared.toot.name'),
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
    })
  }, [])

  const flRef = useRef<FlatList>(null)
  const scrolled = useRef(false)

  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Toot', toot: toot.id }]
  const { data, status, refetch } = useTootQuery({
    ...queryKey[1],
    options: {
      meta: { toot },
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
  })

  const empty = () => {
    switch (status) {
      case 'loading':
        return <Circle size={StyleConstants.Font.Size.L} color={colors.secondary} />
      case 'error':
        return (
          <>
            <Icon name='Frown' size={StyleConstants.Font.Size.L} color={colors.primaryDefault} />
            <CustomText
              fontStyle='M'
              style={{
                marginTop: StyleConstants.Spacing.S,
                marginBottom: StyleConstants.Spacing.L,
                color: colors.primaryDefault
              }}
            >
              {t('componentTimeline:empty.error.message')}
            </CustomText>
            <Button
              type='text'
              content={t('componentTimeline:empty.error.button')}
              onPress={() => refetch()}
            />
          </>
        )
      case 'success':
        return (
          <>
            <Icon
              name='Smartphone'
              size={StyleConstants.Font.Size.L}
              color={colors.primaryDefault}
            />
            <CustomText
              fontStyle='M'
              style={{
                marginTop: StyleConstants.Spacing.S,
                marginBottom: StyleConstants.Spacing.L,
                color: colors.secondary
              }}
            >
              {t('componentTimeline:empty.success.message')}
            </CustomText>
          </>
        )
    }
  }

  const heights = useRef<(number | undefined)[]>([])
  const MAX_LEVEL = 10
  const ARC = StyleConstants.Avatar.XS / 4

  return (
    <FlatList
      ref={flRef}
      scrollEventThrottle={16}
      windowSize={7}
      data={data?.pages[0].body}
      renderItem={({ item, index }) => {
        const prev = data?.pages[0].body[index - 1]?._level || 0
        const curr = item._level
        const next = data?.pages[0].body[index + 1]?._level || 0

        return (
          <View
            style={{
              paddingLeft:
                index > (data?.highlightIndex || 0)
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
              queryKey={queryKey}
              rootQueryKey={rootQueryKey}
              highlighted={toot.id === item.id}
              isConversation={toot.id !== item.id}
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
          error.index < (data?.pages[0].body.length || 0) &&
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
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            minHeight: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.backgroundDefault
          }}
        >
          {empty()}
        </View>
      }
    />
  )
}

export default TabSharedToot
