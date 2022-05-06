import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback } from 'react'
import { Pressable } from 'react-native'
import analytics from './analytics'
import CustomText from './Text'

export interface Props {
  hashtag: Mastodon.Tag
  onPress?: () => void
  origin?: string
}

const ComponentHashtag: React.FC<Props> = ({
  hashtag,
  onPress: customOnPress,
  origin
}) => {
  const { colors } = useTheme()
  const navigation =
    useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  const onPress = useCallback(() => {
    analytics('search_account_press', { page: origin })
    navigation.push('Tab-Shared-Hashtag', { hashtag: hashtag.name })
  }, [])

  return (
    <Pressable
      accessibilityRole='button'
      style={{ padding: StyleConstants.Spacing.S * 1.5 }}
      onPress={customOnPress || onPress}
    >
      <CustomText fontStyle='M' style={{ color: colors.primaryDefault }}>
        #{hashtag.name}
      </CustomText>
    </Pressable>
  )
}

export default ComponentHashtag
