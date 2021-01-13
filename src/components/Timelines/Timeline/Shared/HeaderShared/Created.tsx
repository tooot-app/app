import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Moment from 'react-moment'
import { StyleSheet, Text } from 'react-native'

export interface Props {
  created_at: Mastodon.Status['created_at']
}

const HeaderSharedCreated: React.FC<Props> = ({ created_at }) => {
  const { theme } = useTheme()
  const { i18n } = useTranslation()

  return (
    <Text style={[styles.created_at, { color: theme.secondary }]}>
      <Moment date={created_at} locale={i18n.language} element={Text} fromNow />
    </Text>
  )
}

const styles = StyleSheet.create({
  created_at: {
    ...StyleConstants.FontStyle.S
  }
})

export default React.memo(HeaderSharedCreated, () => true)
