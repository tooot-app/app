import GracefullyImage from '@components/GracefullyImage'
import openLink from '@components/openLink'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export interface Props {
  card: Mastodon.Card
}

const TimelineCard: React.FC<Props> = ({ card }) => {
  const { theme } = useTheme()

  return (
    <Pressable
      style={[styles.card, { borderColor: theme.border }]}
      onPress={async () => await openLink(card.url)}
      testID='base'
    >
      {card.image && (
        <GracefullyImage
          uri={{ original: card.image }}
          blurhash={card.blurhash}
          style={styles.left}
        />
      )}
      <View style={styles.right}>
        <Text
          numberOfLines={2}
          style={[styles.rightTitle, { color: theme.primary }]}
          testID='title'
        >
          {card.title}
        </Text>
        {card.description ? (
          <Text
            numberOfLines={1}
            style={[styles.rightDescription, { color: theme.primary }]}
            testID='description'
          >
            {card.description}
          </Text>
        ) : null}
        <Text numberOfLines={1} style={{ color: theme.secondary }}>
          {card.url}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    height: StyleConstants.Font.LineHeight.M * 4.5,
    marginTop: StyleConstants.Spacing.M,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6
  },
  left: {
    width: StyleConstants.Font.LineHeight.M * 4.5,
    height: StyleConstants.Font.LineHeight.M * 4.5
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6
  },
  right: {
    flex: 1,
    padding: StyleConstants.Spacing.S
  },
  rightTitle: {
    marginBottom: StyleConstants.Spacing.XS,
    fontWeight: StyleConstants.Font.Weight.Bold
  },
  rightDescription: {
    marginBottom: StyleConstants.Spacing.XS
  }
})

export default React.memo(TimelineCard, () => true)
