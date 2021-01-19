import { useAccountQuery } from '@utils/queryHooks/account'
import { InstanceLocal } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'
import { Chase } from 'react-native-animated-spinkit'

const ComposePostingAs: React.FC<{
  id: Mastodon.Account['id']
  domain: InstanceLocal['url']
}> = ({ id, domain }) => {
  const { t } = useTranslation('sharedCompose')
  const { theme } = useTheme()

  const { data, status } = useAccountQuery({ id })

  switch (status) {
    case 'loading':
      return (
        <Chase
          size={StyleConstants.Font.LineHeight.M - 2}
          color={theme.secondary}
        />
      )
    case 'success':
      return (
        <Text style={[styles.text, { color: theme.secondary }]}>
          {t('content.root.header.postingAs', { acct: data?.acct, domain })}
        </Text>
      )
    default:
      return null
  }
}

const styles = StyleSheet.create({
  text: {
    ...StyleConstants.FontStyle.S
  }
})

export default ComposePostingAs
