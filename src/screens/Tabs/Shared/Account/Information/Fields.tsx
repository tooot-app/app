import Icon from '@components/Icon'
import { ParseHTML } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo?: boolean
}

const AccountInformationFields = React.memo(
  ({ account, myInfo }: Props) => {
    if (myInfo || !account?.fields || account.fields.length === 0) {
      return null
    }

    const { theme } = useTheme()

    return (
      <View style={[styles.fields, { borderTopColor: theme.border }]}>
        {account.fields.map((field, index) => (
          <View
            key={index}
            style={[styles.field, { borderBottomColor: theme.border }]}
          >
            <View
              style={[styles.fieldLeft, { borderRightColor: theme.border }]}
            >
              <ParseHTML
                content={field.name}
                size={'S'}
                emojis={account.emojis}
                showFullLink
                numberOfLines={5}
                selectable
              />
              {field.verified_at ? (
                <Icon
                  name='CheckCircle'
                  size={StyleConstants.Font.Size.M}
                  color={theme.primaryDefault}
                  style={styles.fieldCheck}
                />
              ) : null}
            </View>
            <View style={styles.fieldRight}>
              <ParseHTML
                content={field.value}
                size={'S'}
                emojis={account.emojis}
                showFullLink
                numberOfLines={5}
                selectable
              />
            </View>
          </View>
        ))}
      </View>
    )
  },
  (_, next) => next.account === undefined
)

const styles = StyleSheet.create({
  fields: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: StyleConstants.Spacing.M
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: StyleConstants.Spacing.S,
    paddingBottom: StyleConstants.Spacing.S
  },
  fieldLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    paddingLeft: StyleConstants.Spacing.S,
    paddingRight: StyleConstants.Spacing.S
  },
  fieldCheck: { marginLeft: StyleConstants.Spacing.XS },
  fieldRight: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: StyleConstants.Spacing.S,
    paddingRight: StyleConstants.Spacing.S
  }
})

export default AccountInformationFields
