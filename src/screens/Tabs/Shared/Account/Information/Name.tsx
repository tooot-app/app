import { ParseEmojis } from '@components/Parse'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { View } from 'react-native'
import { PlaceholderLine } from 'rn-placeholder'
import AccountContext from '../Context'

const AccountInformationName: React.FC = () => {
  const { account } = useContext(AccountContext)

  const { colors } = useTheme()

  return (
    <View
      style={{
        borderRadius: 0,
        marginTop: StyleConstants.Spacing.S,
        marginBottom: StyleConstants.Spacing.XS,
        flexDirection: 'row'
      }}
    >
      {account ? (
        <>
          <CustomText
            style={{
              textDecorationLine: account?.moved || account.suspended ? 'line-through' : undefined
            }}
          >
            <ParseEmojis
              content={account.display_name || account.username}
              emojis={account.emojis}
              size='L'
              fontBold
            />
          </CustomText>
          {account.moved ? (
            <View style={{ marginLeft: StyleConstants.Spacing.S }}>
              <ParseEmojis
                content={account.moved.display_name || account.moved.username}
                emojis={account.moved.emojis}
                size='L'
                fontBold
              />
            </View>
          ) : null}
        </>
      ) : (
        <PlaceholderLine
          width={StyleConstants.Font.Size.L * 2}
          height={StyleConstants.Font.LineHeight.L}
          color={colors.shimmerDefault}
          noMargin
          style={{ borderRadius: 0 }}
        />
      )}
    </View>
  )
}

export default AccountInformationName
