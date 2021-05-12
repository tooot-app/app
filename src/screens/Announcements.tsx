import analytics from '@components/analytics'
import Button from '@components/Button'
import haptics from '@components/haptics'
import { ParseHTML } from '@components/Parse'
import RelativeTime from '@components/RelativeTime'
import { BlurView } from '@react-native-community/blur'
import { StackScreenProps } from '@react-navigation/stack'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import {
  useAnnouncementMutation,
  useAnnouncementQuery
} from '@utils/queryHooks/announcement'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import FastImage from 'react-native-fast-image'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

export type ScreenAnnouncementsProp = StackScreenProps<
  Nav.RootStackParamList,
  'Screen-Announcements'
>

const ScreenAnnouncements: React.FC<ScreenAnnouncementsProp> = ({
  route: {
    params: { showAll = false }
  },
  navigation
}) => {
  const { reduceMotionEnabled } = useAccessibility()
  const { mode, theme } = useTheme()
  const [index, setIndex] = useState(0)
  const { t } = useTranslation('screenAnnouncements')

  const query = useAnnouncementQuery({
    showAll,
    options: {
      select: announcements =>
        announcements.filter(announcement =>
          showAll ? announcement : !announcement.read
        )
    }
  })
  const mutation = useAnnouncementMutation({
    onSettled: () => {
      haptics('Success')
      query.refetch()
    }
  })

  useEffect(() => {
    if (!showAll && query.data?.length === 0) {
      navigation.goBack()
    }
  }, [query.data])

  const renderItem = useCallback(
    ({ item, index }: { item: Mastodon.Announcement; index: number }) => (
      <View key={index} style={styles.announcementContainer}>
        <Pressable
          style={styles.pressable}
          onPress={() => navigation.goBack()}
        />
        <View
          style={[
            styles.announcement,
            {
              borderColor: theme.primaryDefault,
              backgroundColor: theme.backgroundDefault
            }
          ]}
        >
          <Text style={[styles.published, { color: theme.secondary }]}>
            <Trans
              i18nKey='screenAnnouncements:content.published'
              components={[<RelativeTime date={item.published_at} />]}
            />
          </Text>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator>
            <ParseHTML
              content={item.content}
              size='M'
              emojis={item.emojis}
              mentions={item.mentions}
              numberOfLines={999}
            />
          </ScrollView>
          {item.reactions?.length ? (
            <View style={styles.reactions}>
              {item.reactions?.map(reaction => (
                <Pressable
                  key={reaction.name}
                  style={[
                    styles.reaction,
                    {
                      borderColor: reaction.me
                        ? theme.disabled
                        : theme.primaryDefault,
                      backgroundColor: reaction.me
                        ? theme.disabled
                        : theme.backgroundDefault
                    }
                  ]}
                  onPress={() => {
                    analytics('accnouncement_reaction_press', {
                      current: reaction.me
                    })
                    mutation.mutate({
                      id: item.id,
                      type: 'reaction',
                      name: reaction.name,
                      me: reaction.me
                    })
                  }}
                >
                  {reaction.url ? (
                    <FastImage
                      source={{
                        uri: reduceMotionEnabled
                          ? reaction.static_url
                          : reaction.url
                      }}
                      style={[styles.reactionImage]}
                    />
                  ) : (
                    <Text style={[styles.reactionText]}>{reaction.name}</Text>
                  )}
                  {reaction.count ? (
                    <Text
                      style={[
                        styles.reactionCount,
                        { color: theme.primaryDefault }
                      ]}
                    >
                      {reaction.count}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
              {/* <Pressable
                style={[styles.reaction, { borderColor: theme.primaryDefault }]}
                onPress={() => invisibleTextInputRef.current?.focus()}
              >
                <Icon
                  name='Plus'
                  size={StyleConstants.Font.Size.M}
                  color={theme.primaryDefault}
                />
              </Pressable> */}
            </View>
          ) : null}
          <Button
            type='text'
            content={
              item.read ? t('content.button.read') : t('content.button.unread')
            }
            loading={mutation.isLoading}
            disabled={item.read}
            onPress={() => {
              analytics('accnouncement_read_press')
              !item.read &&
                mutation.mutate({
                  id: item.id,
                  type: 'dismiss'
                })
            }}
          />
        </View>
      </View>
    ),
    [theme]
  )

  const onMomentumScrollEnd = useCallback(
    ({
      nativeEvent: {
        contentOffset: { x },
        layoutMeasurement: { width }
      }
    }) => {
      setIndex(Math.floor(x / width))
    },
    []
  )

  const ListEmptyComponent = useCallback(() => {
    return (
      <View
        style={{
          width: Dimensions.get('screen').width,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Circle size={StyleConstants.Font.Size.L} color={theme.secondary} />
      </View>
    )
  }, [])

  return (
    <BlurView
      blurType={mode}
      blurAmount={20}
      style={styles.base}
      reducedTransparencyFallbackColor={theme.backgroundDefault}
    >
      <SafeAreaView style={styles.base}>
        <FlatList
          horizontal
          data={query.data}
          pagingEnabled
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          ListEmptyComponent={ListEmptyComponent}
        />
        <View style={styles.indicators}>
          {query.data && query.data.length > 1 ? (
            <>
              {query.data.map((d, i) => (
                <View
                  key={i}
                  style={[
                    styles.indicator,
                    {
                      borderColor: theme.primaryDefault,
                      backgroundColor:
                        i === index ? theme.primaryDefault : undefined,
                      marginLeft:
                        i === query.data.length ? 0 : StyleConstants.Spacing.S
                    }
                  ]}
                />
              ))}
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1
  },
  invisibleTextInput: { ...StyleSheet.absoluteFillObject },
  announcementContainer: {
    width: Dimensions.get('screen').width,
    padding: StyleConstants.Spacing.Global.PagePadding,
    justifyContent: 'center'
  },
  published: {
    ...StyleConstants.FontStyle.S,
    marginBottom: StyleConstants.Spacing.S
  },
  pressable: { ...StyleSheet.absoluteFillObject },
  announcement: {
    flexShrink: 1,
    padding: StyleConstants.Spacing.Global.PagePadding,
    marginTop: StyleConstants.Spacing.Global.PagePadding,
    borderWidth: 1,
    borderRadius: 6
  },
  scrollView: {
    marginBottom: StyleConstants.Spacing.Global.PagePadding / 2
  },
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: StyleConstants.Spacing.Global.PagePadding / 2
  },
  reaction: {
    borderWidth: 1,
    padding: StyleConstants.Spacing.Global.PagePadding / 2,
    marginTop: StyleConstants.Spacing.Global.PagePadding / 2,
    marginBottom: StyleConstants.Spacing.Global.PagePadding / 2,
    marginRight: StyleConstants.Spacing.M,
    borderRadius: 6,
    flexDirection: 'row'
  },
  reactionImage: {
    width: StyleConstants.Font.LineHeight.M + 3,
    height: StyleConstants.Font.LineHeight.M
  },
  reactionText: {
    ...StyleConstants.FontStyle.M
  },
  reactionCount: {
    ...StyleConstants.FontStyle.S,
    marginLeft: StyleConstants.Spacing.S
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 49
  },
  indicator: {
    width: StyleConstants.Spacing.S,
    height: StyleConstants.Spacing.S,
    borderRadius: StyleConstants.Spacing.S,
    borderWidth: 1
  }
})

export default ScreenAnnouncements
