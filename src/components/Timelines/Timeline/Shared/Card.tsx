import React, { useEffect, useMemo, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import openLink from '@components/openLink'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { Surface } from 'gl-react-expo'
import { Blurhash } from 'gl-react-blurhash'

export interface Props {
  card: Mastodon.Card
}

type CancelPromise = ((reason?: Error) => void) | undefined
type ImageSize = { width: number; height: number }
interface ImageSizeOperation {
  start: () => Promise<ImageSize>
  cancel: CancelPromise
}
const getImageSize = (uri: string): ImageSizeOperation => {
  let cancel: CancelPromise
  const start = (): Promise<ImageSize> =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      cancel = reject
      Image.getSize(
        uri,
        (width, height) => {
          cancel = undefined
          resolve({ width, height })
        },
        error => {
          reject(error)
        }
      )
    })

  return { start, cancel }
}

const TimelineCard: React.FC<Props> = ({ card }) => {
  const { theme } = useTheme()

  const [imageLoaded, setImageLoaded] = useState(false)
  useEffect(() => {
    if (card.image) {
      Image.getSize(card.image, () => setImageLoaded(true))
    }
  }, [])
  useEffect(() => {
    let cancel: CancelPromise
    const sideEffect = async (): Promise<void> => {
      try {
        const operation = getImageSize(card.image)
        cancel = operation.cancel
        await operation.start()
      } catch (error) {
        if (__DEV__) console.warn(error)
      }
    }
    if (card.image) {
      sideEffect()
    }
    return () => {
      if (cancel) {
        cancel()
      }
    }
  })
  const cardVisual = useMemo(() => {
    if (imageLoaded) {
      return <Image source={{ uri: card.image }} style={styles.image} />
    } else {
      return card.blurhash ? (
        <Surface style={styles.image}>
          <Blurhash hash={card.blurhash} />
        </Surface>
      ) : null
    }
  }, [imageLoaded])

  return (
    <Pressable
      style={[styles.card, { borderColor: theme.border }]}
      onPress={async () => await openLink(card.url)}
      testID='base'
    >
      {card.image && (
        <View style={styles.left} testID='image'>
          {cardVisual}
        </View>
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
