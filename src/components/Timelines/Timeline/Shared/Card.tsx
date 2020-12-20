import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import openLink from '@root/utils/openLink'

export interface Props {
  card: Mastodon.Card
}

const TimelineCard: React.FC<Props> = ({ card }) => {
  const { theme } = useTheme()

  return (
    <Pressable
      style={[styles.card, { borderColor: theme.border }]}
      onPress={async () => await openLink(card.url)}
    >
      {card.image && (
        <View style={styles.left}>
          <Image source={{ uri: card.image }} style={styles.image} />
        </View>
      )}
      <View style={styles.right}>
        <Text
          numberOfLines={2}
          style={[styles.rightTitle, { color: theme.primary }]}
        >
          {card.title}
        </Text>
        {card.description ? (
          <Text
            numberOfLines={1}
            style={[styles.rightDescription, { color: theme.primary }]}
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
    height: StyleConstants.Avatar.L,
    marginTop: StyleConstants.Spacing.M,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6
  },
  left: {
    width: StyleConstants.Avatar.L
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
