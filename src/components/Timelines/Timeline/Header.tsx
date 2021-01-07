import { useNavigation } from '@react-navigation/native'
import Icon from '@root/components/Icon'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const TimelineHeader = React.memo(
  () => {
    const navigation = useNavigation()
    const { theme } = useTheme()

    return (
      <View style={[styles.base, { borderColor: theme.border }]}>
        <Text style={[styles.text, { color: theme.primary }]}>
          一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字{' '}
          <Text
            style={{ color: theme.blue }}
            onPress={() =>
              navigation.navigate('Screen-Me', {
                screen: 'Screen-Me-Settings-UpdateRemote'
              })
            }
          >
            前往设置{' '}
            <Icon
              name='ArrowRight'
              size={StyleConstants.Font.Size.S}
              color={theme.blue}
            />
          </Text>
        </Text>
      </View>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  base: {
    margin: StyleConstants.Spacing.Global.PagePadding,
    paddingHorizontal: StyleConstants.Spacing.M,
    paddingVertical: StyleConstants.Spacing.S,
    borderWidth: 1,
    borderRadius: 6
  },
  text: {
    ...StyleConstants.FontStyle.S
  }
})

export default TimelineHeader
