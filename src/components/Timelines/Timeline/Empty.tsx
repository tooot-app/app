import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import { QueryStatus } from 'react-query'
import Button from '@components/Button'
import { Feather } from '@expo/vector-icons'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'

export interface Props {
  status: QueryStatus
  refetch: () => void
}

const TimelineEmpty: React.FC<Props> = ({ status, refetch }) => {
  const { theme } = useTheme()

  const children = useMemo(() => {
    switch (status) {
      case 'loading':
        return (
          <Chase size={StyleConstants.Font.Size.L} color={theme.secondary} />
        )
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
            <Button type='text' content='重试' onPress={() => refetch()} />
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
    ...StyleConstants.FontStyle.M,
    marginTop: StyleConstants.Spacing.S,
    marginBottom: StyleConstants.Spacing.L
  }
})

export default TimelineEmpty
