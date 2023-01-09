import { ParseHTML } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { View } from 'react-native'
import AccountContext from '../Context'

const AccountInformationPrivateNote: React.FC = () => {
  const { relationship, pageMe } = useContext(AccountContext)
  if (pageMe) return null

  const { colors } = useTheme()

  return relationship?.note ? (
    <View
      style={{
        marginBottom: StyleConstants.Spacing.L,
        borderLeftColor: colors.border,
        borderLeftWidth: StyleConstants.Spacing.XS,
        paddingLeft: StyleConstants.Spacing.S
      }}
    >
      <ParseHTML content={relationship.note} size={'S'} selectable numberOfLines={2} />
    </View>
  ) : null
}

export default AccountInformationPrivateNote
