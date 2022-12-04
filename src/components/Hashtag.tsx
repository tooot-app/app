import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useState } from 'react'
import { Dimensions, Pressable } from 'react-native'
import Sparkline from './Sparkline'
import CustomText from './Text'

export interface Props {
  hashtag: Mastodon.Tag
  onPress?: () => void
}

const ComponentHashtag: React.FC<Props> = ({ hashtag, onPress: customOnPress }) => {
  const { colors } = useTheme()
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  const onPress = useCallback(() => {
    navigation.push('Tab-Shared-Hashtag', { hashtag: hashtag.name })
  }, [])

  const padding = StyleConstants.Spacing.Global.PagePadding
  const width = Dimensions.get('window').width / 4
  const [height, setHeight] = useState<number>(0)

  return (
    <Pressable
      accessibilityRole='button'
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding
      }}
      onPress={customOnPress || onPress}
      onLayout={({
        nativeEvent: {
          layout: { height }
        }
      }) => setHeight(height - padding * 2 - 1)}
    >
      <CustomText
        fontStyle='M'
        style={{
          flexShrink: 1,
          color: colors.primaryDefault,
          paddingRight: StyleConstants.Spacing.M
        }}
        numberOfLines={1}
      >
        #{hashtag.name}
      </CustomText>
      <Sparkline
        data={hashtag.history.map(h => parseInt(h.uses)).reverse()}
        width={width}
        height={height}
      />
    </Pressable>
  )
}

export default ComponentHashtag
