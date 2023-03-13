import GracefullyImage from '@components/GracefullyImage'
import openLink from '@components/openLink'
import CustomText from '@components/Text'
import { useNeodbQuery } from '@utils/queryHooks/neodb'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Linking from 'expo-linking'
import { Pressable, View } from 'react-native'

export const CardNeodb = ({ card }: { card: Mastodon.Card }) => {
  const { colors } = useTheme()

  const segments = Linking.parse(card.url).path?.split('/')
  if (!segments || !(segments[0] === 'movie' || segments[0] === 'book')) return null

  const { data } = useNeodbQuery({ path: `${segments[0]}/${segments[1]}` })

  if (!data) return null

  switch (segments[0]) {
    case 'movie':
      return (
        <Pressable
          style={{
            marginTop: StyleConstants.Spacing.S,
            backgroundColor: colors.shimmerDefault,
            borderRadius: StyleConstants.BorderRadius,
            padding: StyleConstants.Spacing.S,
            flexDirection: 'row'
          }}
          onPress={() => openLink(card.url)}
        >
          <GracefullyImage
            sources={{ default: { uri: `https://neodb.social${data.image}` } }}
            dimension={{
              width: StyleConstants.Font.LineHeight.M * 4,
              height: StyleConstants.Font.LineHeight.M * 5
            }}
            style={{ marginRight: StyleConstants.Spacing.S }}
            imageStyle={{ borderRadius: StyleConstants.BorderRadius / 2 }}
            dim
          />
          <View style={{ flex: 1, gap: StyleConstants.Spacing.S }}>
            <CustomText
              fontStyle='S'
              fontWeight='Bold'
              style={{ color: colors.primaryDefault }}
              numberOfLines={3}
            >
              {[
                data.data.title,
                data.data.orig_title,
                data.data.year ? `(${data.data.year})` : null
              ]
                .filter(d => d)
                .join(' ')}
            </CustomText>
            <CustomText fontStyle='S' style={{ color: colors.secondary }} numberOfLines={2}>
              {[
                data.data.duration ? `${data.data.duration}分钟` : null,
                data.data.area?.join(' '),
                data.data.genre?.join(' '),
                data.data.director?.join(' ')
              ]
                .filter(d => d)
                .join(' / ')}
            </CustomText>
          </View>
        </Pressable>
      )
    case 'book':
      return (
        <Pressable
          style={{
            marginTop: StyleConstants.Spacing.S,
            backgroundColor: colors.shimmerDefault,
            borderRadius: StyleConstants.BorderRadius,
            padding: StyleConstants.Spacing.S,
            flexDirection: 'row'
          }}
          onPress={() => openLink(card.url)}
        >
          <GracefullyImage
            sources={{ default: { uri: `https://neodb.social${data.image}` } }}
            dimension={{
              width: StyleConstants.Font.LineHeight.M * 4,
              height: StyleConstants.Font.LineHeight.M * 5
            }}
            style={{ marginRight: StyleConstants.Spacing.S }}
            imageStyle={{ borderRadius: StyleConstants.BorderRadius / 2 }}
            dim
          />
          <View style={{ flex: 1, gap: StyleConstants.Spacing.S }}>
            <CustomText
              fontStyle='S'
              fontWeight='Bold'
              style={{ color: colors.primaryDefault }}
              numberOfLines={3}
            >
              {[
                data.data.title,
                data.data.pub_year && data.data.pub_month
                  ? `(${data.data.pub_year}年${data.data.pub_month}月)`
                  : null
              ]
                .filter(d => d)
                .join(' ')}
            </CustomText>
            <CustomText fontStyle='S' style={{ color: colors.secondary }} numberOfLines={2}>
              {[
                data.data.author?.join(' '),
                data.data.language,
                data.data.pages ? `${data.data.pages}页` : null,
                data.data.pub_house
              ]
                .filter(d => d)
                .join(' / ')}
            </CustomText>
          </View>
        </Pressable>
      )
    default:
      return null
  }
}
