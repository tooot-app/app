import GracefullyImage from '@components/GracefullyImage'
import Icon from '@components/Icon'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { useTimelineQuery } from '@utils/queryHooks/timeline'
import { flattenPages } from '@utils/queryHooks/utils'
import { StyleConstants } from '@utils/styles/constants'
import { isLargeDevice } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { Dimensions, Pressable, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import AccountContext from './Context'

export type Props = {
  remote_id?: Mastodon.Status['id']
  remote_domain?: string
}

const AccountAttachments: React.FC<Props> = ({ remote_id, remote_domain }) => {
  const { account } = useContext(AccountContext)

  if (account?.suspended) return null

  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()
  const { colors } = useTheme()

  const DISPLAY_AMOUNT = isLargeDevice ? 8 : 6

  const width =
    (Dimensions.get('window').width - StyleConstants.Spacing.Global.PagePadding * 2) /
    (DISPLAY_AMOUNT - 1)

  const { data } = useTimelineQuery({
    page: 'Account',
    type: 'attachments',
    id: account?.id,
    ...(remote_id && remote_domain && { remote_id, remote_domain }),
    options: { enabled: !!account?.id || (!!remote_id && !!remote_domain) }
  })

  const flattenData = flattenPages(data)
    .filter(status => !(status as Mastodon.Status).sensitive)
    .splice(0, DISPLAY_AMOUNT)

  if (!flattenData.length) return null

  return (
    <View
      style={{
        flex: 1,
        height: width + StyleConstants.Spacing.Global.PagePadding * 2,
        paddingVertical: StyleConstants.Spacing.Global.PagePadding,
        paddingRight: StyleConstants.Spacing.Global.PagePadding,
        borderTopWidth: 1,
        borderTopColor: colors.border
      }}
    >
      <FlatList
        horizontal
        data={flattenData}
        renderItem={({ item, index }) => {
          if (index === DISPLAY_AMOUNT - 1 && (!remote_id || !remote_domain)) {
            return (
              <Pressable
                onPress={() => {
                  account && navigation.push('Tab-Shared-Attachments', { account })
                }}
                children={
                  <View
                    style={{
                      marginLeft: StyleConstants.Spacing.Global.PagePadding,
                      backgroundColor: colors.backgroundOverlayInvert,
                      width: width,
                      height: width,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    children={
                      <Icon
                        name='more-horizontal'
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
                sources={{
                  preview: {
                    uri: item.media_attachments[0]?.preview_url,
                    width: item.media_attachments[0]?.meta?.small?.width,
                    height: item.media_attachments[0]?.meta?.small?.height
                  },
                  default: {
                    uri: item.media_attachments[0]?.url,
                    width: item.media_attachments[0]?.meta?.original?.width,
                    height: item.media_attachments[0]?.meta?.original?.height
                  },
                  remote: {
                    uri: item.media_attachments[0]?.remote_url,
                    width: item.media_attachments[0]?.meta?.original?.width,
                    height: item.media_attachments[0]?.meta?.original?.height
                  },
                  blurhash: item.media_attachments[0]?.blurhash
                }}
                dimension={{ width, height: width }}
                style={{
                  marginLeft: StyleConstants.Spacing.Global.PagePadding,
                  borderRadius: StyleConstants.BorderRadius / 2,
                  overflow: 'hidden'
                }}
                onPress={() => navigation.push('Tab-Shared-Toot', { toot: item })}
                dim
              />
            )
          }
        }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
}

export default AccountAttachments
