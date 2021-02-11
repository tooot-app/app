import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'

export interface Props {
  isLoading: boolean
  disable?: boolean
}

const TimelineRefresh: React.FC<Props> = ({ isLoading, disable = false }) => {
  const { theme } = useTheme()
  return !isLoading && !disable ? (
    <View
      style={styles.base}
      children={
        <Circle size={StyleConstants.Font.Size.L} color={theme.secondary} />
      }
    />
  ) : null
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleConstants.Spacing.XL,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default TimelineRefresh
