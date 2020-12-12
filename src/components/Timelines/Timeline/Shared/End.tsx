import { Feather } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'

export interface Props {
  isFetchingMore: false | 'previous' | 'next' | undefined
}

const TimelineEnd: React.FC<Props> = ({ isFetchingMore }) => {
  const { theme } = useTheme()

  return (
    <View style={styles.base}>
      {isFetchingMore ? (
        <ActivityIndicator />
      ) : (
        <Text style={[styles.text, { color: theme.secondary }]}>
          居然刷到底了，喝杯{' '}
          <Feather
            name='coffee'
            size={StyleConstants.Font.Size.S}
            color={theme.secondary}
          />{' '}
          吧
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: StyleConstants.Spacing.M
  },
  text: {
    fontSize: StyleConstants.Font.Size.S,
    marginLeft: StyleConstants.Spacing.S
  }
})

export default TimelineEnd
