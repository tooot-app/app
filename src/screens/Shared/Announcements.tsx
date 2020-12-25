import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import client from '@root/api/client'
import { ButtonRow } from '@root/components/Button'
import ParseContent from '@root/components/ParseContent'
import { announcementFetch } from '@root/utils/fetches/announcementsFetch'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMutation, useQuery } from 'react-query'

const fireMutation = async ({
  announcementId,
  type,
  name,
  me
}: {
  announcementId: Mastodon.Announcement['id']
  type: 'reaction' | 'dismiss'
  name?: Mastodon.AnnouncementReaction['name']
  me?: boolean
}) => {
  switch (type) {
    case 'reaction':
      return client({
        method: me ? 'delete' : 'put',
        instance: 'local',
        url: `announcements/${announcementId}/reactions/${name}`
      })
    case 'dismiss':
      return client({
        method: 'post',
        instance: 'local',
        url: `announcements/${announcementId}/dismiss`
      })
  }
}

const ScreenSharedAnnouncements: React.FC = ({
  route: {
    params: { showAll }
  },
  navigation
}) => {
  const { theme } = useTheme()
  const bottomTabBarHeight = useBottomTabBarHeight()
  const [index, setIndex] = useState(0)

  const queryKey = ['Announcements', { showAll }]
  const { data, refetch } = useQuery(queryKey, announcementFetch, {
    select: announcements =>
      announcements.filter(announcement =>
        showAll ? announcement : !announcement.read
      )
  })
  const { mutate } = useMutation(fireMutation, {
    onSettled: () => {
      refetch()
    }
  })

  useEffect(() => {
    if (!showAll && data?.length === 0) {
      navigation.goBack()
    }
  }, [data])

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
              borderColor: theme.primary,
              backgroundColor: theme.background
            }
          ]}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator>
            <ParseContent
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
                  style={[styles.reaction, { borderColor: theme.primary }]}
                  onPress={() =>
                    mutate({
                      announcementId: item.id,
                      type: 'reaction',
                      name: reaction.name,
                      me: reaction.me
                    })
                  }
                >
                  {reaction.url ? (
                    <Image
                      source={{ uri: reaction.url }}
                      style={[styles.reactionImage]}
                    />
                  ) : (
                    <Text style={[styles.reactionText]}>{reaction.name}</Text>
                  )}
                  {reaction.count ? (
                    <Text
                      style={[styles.reactionCount, { color: theme.primary }]}
                    >
                      {reaction.count}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
              {/* <Pressable
                style={[styles.reaction, { borderColor: theme.primary }]}
                onPress={() => invisibleTextInputRef.current?.focus()}
              >
                <Feather
                  name='plus'
                  size={StyleConstants.Font.Size.M}
                  color={theme.primary}
                />
              </Pressable> */}
            </View>
          ) : null}
          <ButtonRow
            text='标记已读'
            onPress={() => mutate({ type: 'dismiss', announcementId: item.id })}
            style={styles.button}
          />
        </View>
      </View>
    ),
    []
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

  return (
    <SafeAreaView style={[styles.base, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { height: bottomTabBarHeight }]}>
        <Text style={[styles.headerText, { color: theme.primary }]}>公告</Text>
      </View>
      <FlatList
        horizontal
        data={data}
        pagingEnabled
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      <View style={[styles.indicators, { height: bottomTabBarHeight }]}>
        {data && data.length > 1 ? (
          <>
            {data.map((d, i) => (
              <View
                key={i}
                style={[
                  styles.indicator,
                  {
                    borderColor: theme.primary,
                    backgroundColor: i === index ? theme.primary : undefined,
                    marginLeft: i === data.length ? 0 : StyleConstants.Spacing.S
                  }
                ]}
              />
            ))}
          </>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1
  },
  invisibleTextInput: { ...StyleSheet.absoluteFillObject },
  header: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerText: {
    fontSize: StyleConstants.Font.Size.M * 1.5,
    fontWeight: StyleConstants.Font.Weight.Bold
  },
  announcementContainer: {
    width: Dimensions.get('screen').width,
    padding: StyleConstants.Spacing.Global.PagePadding,
    justifyContent: 'center'
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
  reactions: { flexDirection: 'row', flexWrap: 'wrap' },
  reaction: {
    borderWidth: StyleSheet.hairlineWidth,
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
    fontSize: StyleConstants.Font.Size.M
  },
  reactionCount: {
    fontSize: StyleConstants.Font.Size.S,
    marginLeft: StyleConstants.Spacing.S
  },
  button: {
    marginTop: StyleConstants.Spacing.Global.PagePadding / 2
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  indicator: {
    width: StyleConstants.Spacing.S,
    height: StyleConstants.Spacing.S,
    borderRadius: StyleConstants.Spacing.S,
    borderWidth: 1
  }
})

export default ScreenSharedAnnouncements
