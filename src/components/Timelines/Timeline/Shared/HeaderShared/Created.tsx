import relativeTime from '@components/relativeTime'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'

export interface Props {
  created_at: Mastodon.Status['created_at']
}

const HeaderSharedCreated: React.FC<Props> = ({ created_at }) => {
  const { theme } = useTheme()
  const { i18n } = useTranslation()

  const [since, setSince] = useState(relativeTime(created_at, i18n.language))
  useEffect(() => {
    const timer = setTimeout(() => {
      setSince(relativeTime(created_at, i18n.language))
    }, 1000)
    return () => clearTimeout(timer)
  }, [since])

  return (
    <Text style={[styles.created_at, { color: theme.secondary }]}>{since}</Text>
  )
}

const styles = StyleSheet.create({
  created_at: {
    ...StyleConstants.FontStyle.S
  }
})

export default React.memo(HeaderSharedCreated, () => true)
