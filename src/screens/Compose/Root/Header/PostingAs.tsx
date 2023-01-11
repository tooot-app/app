import CustomText from '@components/Text'
import { getAccountStorage, useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

const ComposePostingAs = () => {
  const [accounts] = useGlobalStorage.object('accounts')
  if (!accounts?.length) return null

  const { t } = useTranslation('screenCompose')
  const { colors } = useTheme()

  return (
    <View
      style={{
        marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
        marginTop: StyleConstants.Spacing.S
      }}
    >
      <CustomText fontStyle='S' style={{ color: colors.secondary }}>
        {t('content.root.header.postingAs', {
          acct: getAccountStorage.string('auth.account.acct'),
          domain: getAccountStorage.string('auth.account.domain')
        })}
      </CustomText>
    </View>
  )
}

export default ComposePostingAs
