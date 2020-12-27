import { Feather } from '@expo/vector-icons'
import ParseContent from '@root/components/ParseContent'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export interface Props {
  account: Mastodon.Account
}

const AccountInformationFields: React.FC<Props> = ({ account }) => {
  const { theme } = useTheme()

  return (
    <View style={[styles.fields, { borderTopColor: theme.border }]}>
      {account.fields.map((field, index) => (
        <View
          key={index}
          style={[styles.field, { borderBottomColor: theme.border }]}
        >
          <View style={[styles.fieldLeft, { borderRightColor: theme.border }]}>
            <ParseContent
              content={field.name}
              size={'M'}
              emojis={account.emojis}
              showFullLink
            />
            {field.verified_at && (
              <Feather
                name='check-circle'
                size={StyleConstants.Font.Size.M}
                color={theme.primary}
                style={styles.fieldCheck}
              />
            )}
          </View>
          <View style={styles.fieldRight}>
            <ParseContent
              content={field.value}
              size={'M'}
              emojis={account.emojis}
              showFullLink
            />
          </View>
        </View>
      ))}
    </View>
  )
}

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
    flexBasis: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    paddingLeft: StyleConstants.Spacing.S,
    paddingRight: StyleConstants.Spacing.S
  },
  fieldCheck: { marginLeft: StyleConstants.Spacing.XS },
  fieldRight: {
    flexBasis: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: StyleConstants.Spacing.S,
    paddingRight: StyleConstants.Spacing.S
  }
})

export default AccountInformationFields
