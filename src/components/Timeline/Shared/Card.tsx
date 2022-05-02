import analytics from '@components/analytics'
import GracefullyImage from '@components/GracefullyImage'
import openLink from '@components/openLink'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export interface Props {
  card: Pick<
    Mastodon.Card,
    'url' | 'image' | 'blurhash' | 'title' | 'description'
  >
}

const TimelineCard = React.memo(({ card }: Props) => {
  const { colors } = useTheme()
  const navigation = useNavigation()

  return (
    <Pressable
      accessible
      accessibilityRole='link'
      style={[styles.card, { borderColor: colors.border }]}
      onPress={async () => {
        analytics('timeline_shared_card_press')
        await openLink(card.url, navigation)
      }}
      testID='base'
    >
      {card.image ? (
        <GracefullyImage
          uri={{ original: card.image }}
          blurhash={card.blurhash}
          style={styles.left}
          imageStyle={styles.image}
        />
      ) : null}
      <View style={styles.right}>
        <Text
          numberOfLines={2}
          style={[styles.rightTitle, { color: colors.primaryDefault }]}
          testID='title'
        >
          {card.title}
        </Text>
        {card.description ? (
          <Text
            numberOfLines={1}
            style={[styles.rightDescription, { color: colors.primaryDefault }]}
            testID='description'
          >
            {card.description}
          </Text>
        ) : null}
        <Text
          numberOfLines={1}
          style={[styles.rightLink, { color: colors.secondary }]}
        >
          {card.url}
        </Text>
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    height: StyleConstants.Font.LineHeight.M * 5,
    marginTop: StyleConstants.Spacing.M,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    overflow: 'hidden'
  },
  left: {
    flexBasis: StyleConstants.Font.LineHeight.M * 5
  },
  image: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6
  },
  right: {
    flex: 1,
    padding: StyleConstants.Spacing.S
  },
  rightTitle: {
    ...StyleConstants.FontStyle.S,
    marginBottom: StyleConstants.Spacing.XS,
    fontWeight: StyleConstants.Font.Weight.Bold
  },
  rightDescription: {
    ...StyleConstants.FontStyle.S,
    marginBottom: StyleConstants.Spacing.XS
  },
  rightLink: {
    ...StyleConstants.FontStyle.S
  }
})

export default TimelineCard
