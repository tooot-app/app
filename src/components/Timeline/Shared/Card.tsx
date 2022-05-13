import analytics from '@components/analytics'
import GracefullyImage from '@components/GracefullyImage'
import openLink from '@components/openLink'
import CustomText from '@components/Text'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

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
      style={{
        flex: 1,
        flexDirection: 'row',
        height: StyleConstants.Font.LineHeight.M * 5,
        marginTop: StyleConstants.Spacing.M,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 6,
        overflow: 'hidden',
        borderColor: colors.border
      }}
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
          style={{ flexBasis: StyleConstants.Font.LineHeight.M * 5 }}
          imageStyle={{ borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }}
        />
      ) : null}
      <View style={{ flex: 1, padding: StyleConstants.Spacing.S }}>
        <CustomText
          fontStyle='S'
          numberOfLines={2}
          style={{
            marginBottom: StyleConstants.Spacing.XS,
            color: colors.primaryDefault
          }}
          fontWeight='Bold'
          testID='title'
        >
          {card.title}
        </CustomText>
        {card.description ? (
          <CustomText
            fontStyle='S'
            numberOfLines={1}
            style={{
              marginBottom: StyleConstants.Spacing.XS,
              color: colors.primaryDefault
            }}
            testID='description'
          >
            {card.description}
          </CustomText>
        ) : null}
        <CustomText
          fontStyle='S'
          numberOfLines={1}
          style={{ color: colors.secondary }}
        >
          {card.url}
        </CustomText>
      </View>
    </Pressable>
  )
})

export default TimelineCard
