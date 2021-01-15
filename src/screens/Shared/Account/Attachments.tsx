import GracefullyImage from '@components/GracefullyImage'
import Icon from '@components/Icon'
import { useNavigation } from '@react-navigation/native'
import { useTimelineQuery } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect } from 'react'
import {
  Dimensions,
  ListRenderItem,
  Pressable,
  StyleSheet,
  View
} from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountAttachments = React.memo(
  ({ account }: Props) => {
    const navigation = useNavigation()
    const { theme } = useTheme()

    const width =
      (Dimensions.get('screen').width -
        StyleConstants.Spacing.Global.PagePadding * 2) /
      4

    const queryKeyParams = {
      page: 'Account_Attachments' as 'Account_Attachments',
      account: account?.id
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

    const flattenData = (data?.pages
      ? data.pages.flatMap(d => [...d])
      : []) as Mastodon.Status[]
    useEffect(() => {
      if (flattenData.length) {
        layoutAnimation()
      }
    }, [flattenData.length])

    const renderItem = useCallback<ListRenderItem<Mastodon.Status>>(
      ({ item, index }) => {
        if (index === 3) {
          return (
            <Pressable
              onPress={() =>
                navigation.push('Screen-Shared-Attachments', { account })
              }
              children={
                <View
                  style={{
                    marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
                    backgroundColor: theme.backgroundOverlay,
                    width: width,
                    height: width,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  children={
                    <Icon
                      name='MoreHorizontal'
                      color={theme.primaryOverlay}
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
                original: item.media_attachments[0].preview_url,
                remote: item.media_attachments[0].remote_url
              }}
              blurhash={item.media_attachments[0].blurhash}
              dimension={{ width: width, height: width }}
              style={{ marginLeft: StyleConstants.Spacing.Global.PagePadding }}
              onPress={() =>
                navigation.push('Screen-Shared-Toot', { toot: item })
              }
            />
          )
        }
      },
      [account]
    )

    const styleContainer = useAnimatedStyle(() => {
      if (flattenData.length) {
        return {
          height: withTiming(
            width + StyleConstants.Spacing.Global.PagePadding * 2
          ),
          paddingVertical: StyleConstants.Spacing.Global.PagePadding,
          borderTopWidth: 1,
          borderTopColor: theme.border
        }
      } else {
        return {}
      }
    }, [flattenData.length])

    return (
      <Animated.View style={[styles.base, styleContainer]}>
        <FlatList
          horizontal
          data={flattenData.splice(0, 4)}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
        />
      </Animated.View>
    )
  },
  (_, next) => next.account === undefined
)

const styles = StyleSheet.create({
  base: {
    flex: 1
  }
})

export default AccountAttachments
