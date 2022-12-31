import { ParseHTML } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo?: boolean
}

const AccountInformationFields: React.FC<Props> = ({ account, myInfo }) => {
  if (account?.suspended || myInfo || !account?.fields || account.fields.length === 0) {
    return null
  }

  const { colors } = useTheme()

  return (
    <View
      style={{
        borderTopWidth: StyleSheet.hairlineWidth,
        marginBottom: StyleConstants.Spacing.M,
        borderTopColor: colors.border
      }}
    >
      {account.fields.map((field, index) => (
        <View
          key={index}
          style={[
            {
              flex: 1,
              flexDirection: 'row',
              borderBottomWidth: StyleSheet.hairlineWidth,
              paddingTop: StyleConstants.Spacing.S,
              paddingBottom: StyleConstants.Spacing.S,
              borderBottomColor: colors.border
            },
            field.verified_at ? { backgroundColor: 'rgba(0, 255, 0, 0.035)' } : undefined
          ]}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              borderRightWidth: 1,
              paddingLeft: StyleConstants.Spacing.S,
              paddingRight: StyleConstants.Spacing.S,
              borderRightColor: colors.border
            }}
          >
            <ParseHTML
              content={field.name}
              size={'S'}
              emojis={account.emojis}
              showFullLink
              numberOfLines={5}
              selectable
            />
          </View>
          <View
            style={{
              flex: 2,
              justifyContent: 'center',
              paddingLeft: StyleConstants.Spacing.S,
              paddingRight: StyleConstants.Spacing.S
            }}
          >
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
}

export default AccountInformationFields
