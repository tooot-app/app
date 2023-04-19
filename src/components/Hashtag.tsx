import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { PropsWithChildren, useState } from 'react'
import { Dimensions, Pressable, Text, View } from 'react-native'
import Sparkline from './Sparkline'
import CustomText from './Text'
import { sumBy } from 'lodash'

export interface Props {
  hashtag: Mastodon.Tag
  onPress?: () => void
}

const ComponentHashtag: React.FC<PropsWithChildren & Props> = ({
  hashtag,
  onPress: customOnPress,
  children
}) => {
  const { colors } = useTheme()
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  const onPress = () => {
    navigation.push('Tab-Shared-Hashtag', { tag_name: hashtag.name })
  }

  const padding = StyleConstants.Spacing.Global.PagePadding
  const width = Dimensions.get('window').width / 4
  const [height, setHeight] = useState<number>(0)

  const sum = sumBy(hashtag.history, h => parseInt(h.uses))

  return (
    <Pressable
      accessibilityRole='button'
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding
      }}
      onPress={customOnPress || onPress}
    >
      <View
        style={{
          flexShrink: 1,
          paddingRight: StyleConstants.Spacing.M
        }}
      >
        <CustomText fontStyle='M' style={{ color: colors.primaryDefault }} numberOfLines={1}>
          #{hashtag.name}
          {sum ? (
            <>
              {' '}
              <CustomText fontStyle='S' style={{ color: colors.secondary }}>
                ({sumBy(hashtag.history, h => parseInt(h.uses))})
              </CustomText>
            </>
          ) : null}
        </CustomText>
      </View>
      {hashtag.history?.length ? (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' }}
          onLayout={({
            nativeEvent: {
              layout: { height }
            }
          }) => setHeight(height)}
        >
          <Sparkline
            data={hashtag.history.map(h => parseInt(h.uses)).reverse()}
            width={width}
            height={height}
            margin={children ? StyleConstants.Spacing.S : undefined}
            color={!sum ? colors.disabled : undefined}
          />
          {children}
        </View>
      ) : null}
    </Pressable>
  )
}

export default ComponentHashtag
