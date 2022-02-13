import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { PlaceholderLine } from 'rn-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
  hidden?: boolean
}

const AccountInformationCreated = React.memo(
  ({ account, hidden = false }: Props) => {
    if (hidden) {
      return null
    }

    const { i18n } = useTranslation()
    const { colors } = useTheme()
    const { t } = useTranslation('screenTabs')

    if (account) {
      return (
        <View
          style={[styles.base, { flexDirection: 'row', alignItems: 'center' }]}
        >
          <Icon
            name='Calendar'
            size={StyleConstants.Font.Size.S}
            color={colors.secondary}
            style={styles.icon}
          />
          <Text
            style={{
              color: colors.secondary,
              ...StyleConstants.FontStyle.S
            }}
          >
            {t('shared.account.created_at', {
              date: new Date(account.created_at || '').toLocaleDateString(
                i18n.language,
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }
              )
            })}
          </Text>
        </View>
      )
    } else {
      return (
        <PlaceholderLine
          width={StyleConstants.Font.Size.S * 4}
          height={StyleConstants.Font.LineHeight.S}
          color={colors.shimmerDefault}
          noMargin
          style={styles.base}
        />
      )
    }
  },
  (_, next) => next.account === undefined
)

const styles = StyleSheet.create({
  base: {
    borderRadius: 0,
    marginBottom: StyleConstants.Spacing.M
  },
  icon: {
    marginRight: StyleConstants.Spacing.XS
  }
})

export default AccountInformationCreated
