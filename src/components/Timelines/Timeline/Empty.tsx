import { Feather } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { ButtonRow } from 'src/components/Button'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'

export interface Props {
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

const TimelineEmpty: React.FC<Props> = ({ isLoading, isError, refetch }) => {
  const { theme } = useTheme()

  return (
    <View style={styles.base}>
      {isLoading && <ActivityIndicator />}
      {isError && (
        <>
          <Feather
            name='frown'
            size={StyleConstants.Font.Size.L}
            color={theme.primary}
          />
          <Text style={[styles.error, { color: theme.primary }]}>加载错误</Text>
          <ButtonRow text='重试' onPress={() => refetch()} />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  error: {
    fontSize: StyleConstants.Font.Size.M,
    marginTop: StyleConstants.Spacing.S,
    marginBottom: StyleConstants.Spacing.L
  }
})

export default TimelineEmpty
