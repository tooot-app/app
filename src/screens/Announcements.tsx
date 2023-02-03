import Button from '@components/Button'
import haptics from '@components/haptics'
import { Loading } from '@components/Loading'
import { ParseHTML } from '@components/Parse'
import RelativeTime from '@components/RelativeTime'
import CustomText from '@components/Text'
import { BlurView } from '@react-native-community/blur'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { connectMedia } from '@utils/api/helpers/connect'
import { RootStackScreenProps } from '@utils/navigation/navigators'
import { useAnnouncementMutation, useAnnouncementQuery } from '@utils/queryHooks/announcement'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  View
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

const ScreenAnnouncements: React.FC<RootStackScreenProps<'Screen-Announcements'>> = ({
  route: {
    params: { showAll = false }
  },
  navigation
}) => {
  const { reduceMotionEnabled } = useAccessibility()
  const { colors, mode } = useTheme()
  const [index, setIndex] = useState(0)
  const { t } = useTranslation('screenAnnouncements')

  const query = useAnnouncementQuery({
    showAll,
    options: {
      select: announcements =>
        announcements.filter(announcement => (showAll ? announcement : !announcement.read))
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

  const renderItem = ({ item, index }: { item: Mastodon.Announcement; index: number }) => (
    <View
      key={index}
      style={{
        width: Dimensions.get('window').width,
        padding: StyleConstants.Spacing.Global.PagePadding,
        marginVertical: StyleConstants.Spacing.Global.PagePadding,
        justifyContent: 'center'
      }}
    >
      <Pressable style={StyleSheet.absoluteFillObject} onPress={() => navigation.goBack()} />
      <View
        style={{
          flexShrink: 1,
          padding: StyleConstants.Spacing.Global.PagePadding,
          marginTop: StyleConstants.Spacing.Global.PagePadding,
          borderWidth: 1,
          borderRadius: 6,
          borderColor: colors.primaryDefault,
          backgroundColor: colors.backgroundDefault
        }}
      >
        <CustomText
          fontStyle='S'
          style={{
            marginBottom: StyleConstants.Spacing.S,
            color: colors.secondary
          }}
        >
          <Trans
            ns='screenAnnouncements'
            i18nKey='content.published'
            components={[<RelativeTime time={item.published_at} />]}
          />
        </CustomText>
        <ScrollView
          style={{
            marginBottom: StyleConstants.Spacing.Global.PagePadding / 2
          }}
          showsVerticalScrollIndicator
        >
          <ParseHTML
            content={item.content}
            size='M'
            emojis={item.emojis}
            mentions={item.mentions}
            numberOfLines={999}
            selectable
          />
        </ScrollView>
        {item.reactions?.length ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: StyleConstants.Spacing.Global.PagePadding / 2
            }}
          >
            {item.reactions?.map(reaction => (
              <Pressable
                key={reaction.name}
                style={{
                  borderWidth: 1,
                  padding: StyleConstants.Spacing.Global.PagePadding / 2,
                  marginTop: StyleConstants.Spacing.Global.PagePadding / 2,
                  marginBottom: StyleConstants.Spacing.Global.PagePadding / 2,
                  marginRight: StyleConstants.Spacing.M,
                  borderRadius: 6,
                  flexDirection: 'row',
                  borderColor: reaction.me ? colors.disabled : colors.primaryDefault,
                  backgroundColor: reaction.me ? colors.disabled : colors.backgroundDefault
                }}
                onPress={() =>
                  mutation.mutate({
                    id: item.id,
                    type: 'reaction',
                    name: reaction.name,
                    me: reaction.me
                  })
                }
              >
                {reaction.url ? (
                  <FastImage
                    source={connectMedia({
                      uri: reduceMotionEnabled ? reaction.static_url : reaction.url
                    })}
                    style={{
                      width: StyleConstants.Font.LineHeight.M + 3,
                      height: StyleConstants.Font.LineHeight.M
                    }}
                  />
                ) : (
                  <CustomText fontStyle='M'>{reaction.name}</CustomText>
                )}
                {reaction.count ? (
                  <CustomText
                    fontStyle='S'
                    style={{
                      marginLeft: StyleConstants.Spacing.S,
                      color: colors.primaryDefault
                    }}
                  >
                    {reaction.count}
                  </CustomText>
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : null}
        <Button
          type='text'
          content={item.read ? t('content.button.read') : t('content.button.unread')}
          loading={mutation.isLoading}
          disabled={item.read}
          onPress={() => {
            !item.read &&
              mutation.mutate({
                id: item.id,
                type: 'dismiss'
              })
          }}
        />
      </View>
    </View>
  )

  const onMomentumScrollEnd = ({
    nativeEvent: {
      contentOffset: { x },
      layoutMeasurement: { width }
    }
  }: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.floor(x / width))

  const ListEmptyComponent = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Loading />
      </View>
    )
  }

  return Platform.OS === 'ios' ? (
    <BlurView
      blurType={mode}
      blurAmount={20}
      style={{ flex: 1 }}
      reducedTransparencyFallbackColor={colors.backgroundDefault}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          horizontal
          data={query.data}
          pagingEnabled
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          ListEmptyComponent={ListEmptyComponent}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 49
          }}
        >
          {query.data && query.data.length > 1 ? (
            <>
              {query.data.map((d, i) => (
                <View
                  key={i}
                  style={{
                    width: StyleConstants.Spacing.S,
                    height: StyleConstants.Spacing.S,
                    borderRadius: StyleConstants.Spacing.S,
                    borderWidth: 1,
                    borderColor: colors.primaryDefault,
                    backgroundColor: i === index ? colors.primaryDefault : undefined,
                    marginLeft: i === query.data.length ? 0 : StyleConstants.Spacing.S
                  }}
                />
              ))}
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </BlurView>
  ) : (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundDefault }}>
      <FlatList
        horizontal
        data={query.data}
        pagingEnabled
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        ListEmptyComponent={ListEmptyComponent}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 49
        }}
      >
        {query.data && query.data.length > 1 ? (
          <>
            {query.data.map((d, i) => (
              <View
                key={i}
                style={{
                  width: StyleConstants.Spacing.S,
                  height: StyleConstants.Spacing.S,
                  borderRadius: StyleConstants.Spacing.S,
                  borderWidth: 1,
                  borderColor: colors.primaryDefault,
                  backgroundColor: i === index ? colors.primaryDefault : undefined,
                  marginLeft: i === query.data.length ? 0 : StyleConstants.Spacing.S
                }}
              />
            ))}
          </>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

export default ScreenAnnouncements
