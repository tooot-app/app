import { ParseEmojis } from '@components/Parse'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { View } from 'react-native'
import { PlaceholderLine } from 'rn-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationName: React.FC<Props> = ({ account }) => {
  const { colors } = useTheme()

  const movedContent = useMemo(() => {
    if (account?.moved) {
      return (
        <View style={{ marginLeft: StyleConstants.Spacing.S }}>
          <ParseEmojis
            content={account.moved.display_name || account.moved.username}
            emojis={account.moved.emojis}
            size='L'
            fontBold
          />
        </View>
      )
    }
  }, [account?.moved])

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
          {movedContent}
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

export default React.memo(AccountInformationName, (_, next) => next.account === undefined)
