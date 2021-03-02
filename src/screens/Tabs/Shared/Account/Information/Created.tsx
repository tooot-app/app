import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { PlaceholderLine } from 'rn-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationCreated: React.FC<Props> = ({ account }) => {
  const { i18n } = useTranslation()
  const { theme } = useTheme()
  const { t } = useTranslation('sharedAccount')

  if (account) {
    return (
      <View
        style={[styles.base, { flexDirection: 'row', alignItems: 'center' }]}
      >
        <Icon
          name='Calendar'
          size={StyleConstants.Font.Size.S}
          color={theme.secondary}
          style={styles.icon}
        />
        <Text
          style={{
            color: theme.secondary,
            ...StyleConstants.FontStyle.S
          }}
        >
          {t('content.created_at', {
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
        width={StyleConstants.Font.Size.S * 3}
        height={StyleConstants.Font.LineHeight.S}
        color={theme.shimmerDefault}
        noMargin
        style={styles.base}
      />
    )
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 0,
    marginBottom: StyleConstants.Spacing.M
  },
  icon: {
    marginRight: StyleConstants.Spacing.XS
  }
})

export default React.memo(
  AccountInformationCreated,
  (_, next) => next.account === undefined
)
