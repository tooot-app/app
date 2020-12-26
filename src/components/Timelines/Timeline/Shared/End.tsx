import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import { Feather } from '@expo/vector-icons'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'

export interface Props {
  hasNextPage?: boolean
}

const TimelineEnd: React.FC<Props> = ({ hasNextPage }) => {
  const { theme } = useTheme()

  return (
    <View style={styles.base}>
      {hasNextPage ? (
        <Chase size={StyleConstants.Font.Size.L} color={theme.secondary} />
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
