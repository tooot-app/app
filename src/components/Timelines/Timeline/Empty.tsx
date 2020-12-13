import { Feather } from '@expo/vector-icons'
import React, { useMemo } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { QueryStatus } from 'react-query'
import { ButtonRow } from 'src/components/Button'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'

export interface Props {
  status: QueryStatus
  refetch: () => void
}

const TimelineEmpty: React.FC<Props> = ({ status, refetch }) => {
  const { theme } = useTheme()

  const children = useMemo(() => {
    switch (status) {
      case 'loading':
        return <ActivityIndicator />
      case 'error':
        return (
          <>
            <Feather
              name='frown'
              size={StyleConstants.Font.Size.L}
              color={theme.primary}
            />
            <Text style={[styles.error, { color: theme.primary }]}>
              加载错误
            </Text>
            <ButtonRow text='重试' onPress={() => refetch()} />
          </>
        )
      case 'success':
        return (
          <>
            <Feather
              name='smartphone'
              size={StyleConstants.Font.Size.L}
              color={theme.primary}
            />
            <Text style={[styles.error, { color: theme.primary }]}>
              空无一物
            </Text>
            <ButtonRow text='刷新试试' onPress={() => refetch()} />
          </>
        )
    }
  }, [status])
  return <View style={styles.base} children={children} />
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
