import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { useRelationshipQuery } from '@utils/queryHooks/relationship'
import {
  getInstanceAccount,
  getInstanceUri
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import { PlaceholderLine } from 'rn-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
  localInstance: boolean
}

const AccountInformationAccount: React.FC<Props> = ({
  account,
  localInstance
}) => {
  const { t } = useTranslation('screenTabs')
  const { colors } = useTheme()
  const instanceAccount = useSelector(
    getInstanceAccount,
    (prev, next) => prev?.acct === next?.acct
  )
  const instanceUri = useSelector(getInstanceUri)

  const { data: relationship } = useRelationshipQuery({
    id: account?.id || '',
    options: { enabled: account !== undefined }
  })

  const movedContent = useMemo(() => {
    if (account?.moved) {
      return (
        <CustomText
          fontStyle='M'
          style={{
            marginLeft: StyleConstants.Spacing.S,
            color: colors.secondary
          }}
          selectable
        >
          @{account.moved.acct}
        </CustomText>
      )
    }
  }, [account?.moved])

  if (account || (localInstance && instanceAccount)) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 0,
          marginBottom: StyleConstants.Spacing.L
        }}
      >
        <CustomText
          fontStyle='M'
          style={{
            textDecorationLine: account?.moved ? 'line-through' : undefined,
            color: colors.secondary
          }}
          selectable
        >
          @{localInstance ? instanceAccount?.acct : account?.acct}
          {localInstance ? `@${instanceUri}` : null}
        </CustomText>
        {relationship?.followed_by ? (
          <CustomText fontStyle='M' style={{ color: colors.secondary }}>
            {t('shared.account.followed_by')}
          </CustomText>
        ) : null}
        {movedContent}
        {account?.locked ? (
          <Icon
            name='Lock'
            style={{ marginLeft: StyleConstants.Spacing.S }}
            color={colors.secondary}
            size={StyleConstants.Font.Size.M}
          />
        ) : null}
        {account?.bot ? (
          <Icon
            name='HardDrive'
            style={{ marginLeft: StyleConstants.Spacing.S }}
            color={colors.secondary}
            size={StyleConstants.Font.Size.M}
          />
        ) : null}
      </View>
    )
  } else {
    return (
      <PlaceholderLine
        width={StyleConstants.Font.Size.M * 3}
        height={StyleConstants.Font.LineHeight.M}
        color={colors.shimmerDefault}
        noMargin
        style={{ borderRadius: 0, marginBottom: StyleConstants.Spacing.L }}
      />
    )
  }
}

export default React.memo(
  AccountInformationAccount,
  (_, next) => next.account === undefined
)
