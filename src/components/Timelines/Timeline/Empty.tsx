import Button from '@components/Button'
import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import { QueryStatus } from 'react-query'

export interface Props {
  status: QueryStatus
  refetch: () => void
}

const TimelineEmpty: React.FC<Props> = ({ status, refetch }) => {
  const { mode, theme } = useTheme()
  const { t, i18n } = useTranslation('componentTimeline')

  const children = useMemo(() => {
    switch (status) {
      case 'loading':
        return (
          <Chase size={StyleConstants.Font.Size.L} color={theme.secondary} />
        )
      case 'error':
        return (
          <>
            <Icon
              name='Frown'
              size={StyleConstants.Font.Size.L}
              color={theme.primary}
            />
            <Text style={[styles.error, { color: theme.primary }]}>
              {t('empty.error.message')}
            </Text>
            <Button
              type='text'
              content={t('empty.error.button')}
              onPress={() => refetch()}
            />
          </>
        )
      case 'success':
        return (
          <>
            <Icon
              name='Smartphone'
              size={StyleConstants.Font.Size.L}
              color={theme.primary}
            />
            <Text style={[styles.error, { color: theme.primary }]}>
              {t('empty.success.message')}
            </Text>
          </>
        )
    }
  }, [mode, i18n.language, status])
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
