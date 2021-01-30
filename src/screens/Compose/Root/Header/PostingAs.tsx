import { getLocalAccount, getLocalUri } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'
import { useSelector } from 'react-redux'

const ComposePostingAs = React.memo(
  () => {
    const { t } = useTranslation('sharedCompose')
    const { theme } = useTheme()

    const localAccount = useSelector(getLocalAccount)
    const localUri = useSelector(getLocalUri)

    return (
      <Text style={[styles.text, { color: theme.secondary }]}>
        {t('content.root.header.postingAs', {
          acct: localAccount?.acct,
          domain: localUri
        })}
      </Text>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  text: {
    ...StyleConstants.FontStyle.S
  }
})

export default ComposePostingAs
