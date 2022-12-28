import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { useRelationshipQuery } from '@utils/queryHooks/relationship'
import { getAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { PlaceholderLine } from 'rn-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationAccount: React.FC<Props> = ({ account }) => {
  const { t } = useTranslation('screenTabs')
  const { colors } = useTheme()

  const domain = getAccountStorage.string('auth.domain')

  const { data: relationship } = useRelationshipQuery({
    id: account?.id || '',
    options: { enabled: account !== undefined }
  })

  const localInstance = account?.acct.includes('@') ? account?.acct.includes(`@${domain}`) : true

  if (account || localInstance) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 0,
          marginBottom: StyleConstants.Spacing.L
        }}
      >
        <CustomText fontStyle='M' style={{ color: colors.secondary }}>
          {account?.moved ? (
            <>
              {' '}
              <CustomText selectable>@{account.moved.acct}</CustomText>
            </>
          ) : null}
          <CustomText
            style={{
              textDecorationLine: account?.moved || account?.suspended ? 'line-through' : undefined
            }}
            selectable
          >
            @{account?.acct}
            {localInstance ? `@${domain}` : null}
          </CustomText>
          {relationship?.followed_by ? t('shared.account.followed_by') : null}
        </CustomText>
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

export default AccountInformationAccount
