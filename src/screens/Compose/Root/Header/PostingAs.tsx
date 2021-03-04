import {
  getInstanceAccount,
  getInstanceUri
} from '@utils/slices/instancesSlice'
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

    const instanceAccount = useSelector(
      getInstanceAccount,
      (prev, next) => prev?.acct === next?.acct
    )
    const instanceUri = useSelector(getInstanceUri)

    return (
      <Text style={[styles.text, { color: theme.secondary }]}>
        {t('content.root.header.postingAs', {
          acct: instanceAccount?.acct,
          domain: instanceUri
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
