import GracefullyImage from '@components/GracefullyImage'
import Icon from '@components/Icon'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { QueryKeyTimeline, useTimelineQuery } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect } from 'react'
import { Dimensions, ListRenderItem, Pressable, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountAttachments: React.FC<Props> = ({ account }) => {
  if (!account) return null

  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()
  const { colors } = useTheme()

  const DISPLAY_AMOUNT = 6

  const width = (Dimensions.get('window').width - StyleConstants.Spacing.Global.PagePadding * 2) / 4

  const queryKeyParams: QueryKeyTimeline[1] = {
    page: 'Account',
    account: account.id,
    exclude_reblogs: false,
    only_media: true
  }
  const { data, refetch } = useTimelineQuery({
    ...queryKeyParams,
    options: { enabled: false }
  })
  useEffect(() => {
    if (account?.id) {
      refetch()
    }
  }, [account])

  const flattenData = data?.pages
    ? data.pages
        .flatMap(d => [...d.body])
        .filter(status => !(status as Mastodon.Status).sensitive)
        .splice(0, DISPLAY_AMOUNT)
    : []

  const renderItem = useCallback<ListRenderItem<Mastodon.Status>>(
    ({ item, index }) => {
      if (index === DISPLAY_AMOUNT - 1) {
        return (
          <Pressable
            onPress={() => {
              account && navigation.push('Tab-Shared-Attachments', { account })
            }}
            children={
              <View
                style={{
                  marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
                  backgroundColor: colors.backgroundOverlayInvert,
                  width: width,
                  height: width,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                children={
                  <Icon
                    name='MoreHorizontal'
                    color={colors.primaryOverlay}
                    size={StyleConstants.Font.Size.L * 1.5}
                  />
                }
              />
            }
          />
        )
      } else {
        return (
          <GracefullyImage
            uri={{
              original: item.media_attachments[0]?.preview_url || item.media_attachments[0]?.url,
              remote: item.media_attachments[0]?.remote_url
            }}
            blurhash={
              item.media_attachments[0] && (item.media_attachments[0].blurhash || undefined)
            }
            dimension={{ width: width, height: width }}
            style={{ marginLeft: StyleConstants.Spacing.Global.PagePadding }}
            onPress={() => navigation.push('Tab-Shared-Toot', { toot: item })}
          />
        )
      }
    },
    [account]
  )

  const styleContainer = useAnimatedStyle(() => {
    if (flattenData.length) {
      return {
        height: withTiming(width + StyleConstants.Spacing.Global.PagePadding * 2),
        paddingVertical: StyleConstants.Spacing.Global.PagePadding,
        borderTopWidth: 1,
        borderTopColor: colors.border
      }
    } else {
      return {}
    }
  }, [flattenData.length])

  return (
    <Animated.View style={[{ flex: 1 }, styleContainer]}>
      <FlatList
        horizontal
        data={flattenData}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
      />
    </Animated.View>
  )
}

export default AccountAttachments
