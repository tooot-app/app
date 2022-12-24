import CustomText from '@components/Text'
import { getInstanceAccount, getInstanceUri } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const ComposePostingAs = () => {
  const { t } = useTranslation('screenCompose')
  const { colors } = useTheme()

  const instanceAccount = useSelector(getInstanceAccount, (prev, next) => prev?.acct === next?.acct)
  const instanceUri = useSelector(getInstanceUri)

  return (
    <CustomText fontStyle='S' style={{ color: colors.secondary }}>
      {t('content.root.header.postingAs', {
        acct: instanceAccount?.acct,
        domain: instanceUri
      })}
    </CustomText>
  )
}

export default ComposePostingAs
