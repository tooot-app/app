import GracefullyImage from '@components/GracefullyImage'
import openLink from '@components/openLink'
import CustomText from '@components/Text'
import { useNeodbQuery } from '@utils/queryHooks/neodb'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Linking from 'expo-linking'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Rating } from './Rating'

export type Props = {
  card: Mastodon.Card
}

export const CardNeodb: React.FC<Props> = ({ card }) => {
  const { colors } = useTheme()

  const segments = Linking.parse(card.url).path?.split('/')
  if (!segments || !['movie', 'book', 'tv', 'game', 'album', 'podcast'].includes(segments[0]))
    return null

  const [headingLines, setHeadingLines] = useState(3)

  const { data } = useNeodbQuery({
    path:
      segments[0] === 'tv' && segments[1] === 'season'
        ? `${segments[0]}${segments[1]}/${segments[2]}`
        : `${segments[0]}/${segments[1]}`
  })

  if (!data) return null

  const Content = ({ heading, details }: { heading: string[]; details: string[] }) => (
    <Pressable
      style={{
        marginTop: StyleConstants.Spacing.M,
        backgroundColor: colors.shimmerDefault,
        borderRadius: StyleConstants.BorderRadius,
        padding: StyleConstants.Spacing.S,
        flexDirection: 'row'
      }}
      onPress={() => openLink(card.url)}
    >
      {data.cover_image_url ? (
        <GracefullyImage
          sources={{ default: { uri: data.cover_image_url } }}
          dimension={{
            width: StyleConstants.Font.LineHeight.M * 4,
            height: StyleConstants.Font.LineHeight.M * 5
          }}
          style={{ marginRight: StyleConstants.Spacing.S }}
          imageStyle={{ borderRadius: StyleConstants.BorderRadius / 2 }}
          dim
        />
      ) : null}
      <View style={{ flex: 1, gap: StyleConstants.Spacing.S, justifyContent: 'space-between' }}>
        <View style={{ gap: StyleConstants.Spacing.S }}>
          <CustomText
            fontStyle='S'
            fontWeight='Bold'
            style={{ color: colors.primaryDefault }}
            numberOfLines={3}
            onTextLayout={({ nativeEvent }) => setHeadingLines(nativeEvent.lines.length)}
            children={heading.filter(d => d).join(' ')}
          />
          <Rating rating={data.rating / 2} />
        </View>

        <CustomText
          fontStyle='S'
          style={{ color: colors.secondary }}
          numberOfLines={4 - headingLines}
          children={details.filter(d => d).join(' / ')}
        />
      </View>
    </Pressable>
  )

  switch (segments[0]) {
    case 'movie':
      return (
        <Content
          heading={[data.title, data.orig_title, data.year ? `(${data.year})` : null]}
          details={[
            data.duration
              ? parseInt(data.duration).toString() === data.duration
                ? `${data.duration}分钟`
                : data.duration
              : null,
            data.area?.join(' '),
            data.genre?.join(' '),
            data.director?.join(' ')
          ]}
        />
      )
    case 'book':
      return (
        <Content
          heading={[data.title]}
          details={[
            data.author?.join(' '),
            data.pages ? `${data.pages}页` : null,
            data.language,
            data.pub_house
          ]}
        />
      )
    case 'tv':
      if (segments[1] === 'season') {
        return (
          <Content
            heading={[data.title, data.orig_title, data.year ? `(${data.year})` : null]}
            details={[
              data.season_number ? `第${data.season_number}季` : null,
              data.episode_count ? `共${data.episode_count}集` : null,
              data.area?.join(' '),
              data.genre?.join(' '),
              data.director?.join(' ')
            ]}
          />
        )
      } else {
        return (
          <Content
            heading={[data.title, data.orig_title, data.year ? `(${data.year})` : null]}
            details={[
              data.season_count ? `共${data.season_count}季` : null,
              data.area?.join(' '),
              data.genre?.join(' '),
              data.director?.join(' ')
            ]}
          />
        )
      }
    case 'game':
      return (
        <Content
          heading={[data.title]}
          details={[
            data.genre?.join(' '),
            data.developer?.join(' '),
            data.platform?.join(' '),
            data.release_date
          ]}
        />
      )
    case 'album':
      return (
        <Content
          heading={[data.title]}
          details={[
            data.artist.join(' '),
            data.release_date,
            data.duration,
            data.genre.join(' '),
            data.company.join(' ')
          ]}
        />
      )
    case 'podcast':
      return (
        <Content heading={[data.title]} details={[data.hosts.join(' '), data.genre.join(' ')]} />
      )
    default:
      return null
  }
}
