import { useNavigation } from '@react-navigation/native'
import Icon from '@root/components/Icon'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import { updatePublicRemoteNotice } from '@utils/slices/contextsSlice'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

const TimelineHeader = React.memo(
  () => {
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const { theme } = useTheme()

    return (
      <View style={[styles.base, { borderColor: theme.border }]}>
        <Text style={[styles.text, { color: theme.primary }]}>
          一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字一大堆文字{' '}
          <Text
            style={{ color: theme.blue }}
            onPress={() => {
              dispatch(updatePublicRemoteNotice(1))
              navigation.navigate('Screen-Me', {
                screen: 'Screen-Me-Root',
                params: { navigateAway: 'Screen-Me-Settings-UpdateRemote' }
              })
            }}
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
