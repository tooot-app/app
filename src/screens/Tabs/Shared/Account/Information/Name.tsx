import { ParseEmojis } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { PlaceholderLine } from 'rn-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationName: React.FC<Props> = ({ account }) => {
  const { theme } = useTheme()

  const movedStyle = useMemo(
    () =>
      StyleSheet.create({
        base: {
          textDecorationLine: account?.moved ? 'line-through' : undefined
        }
      }),
    [account?.moved]
  )
  const movedContent = useMemo(() => {
    if (account?.moved) {
      return (
        <View style={styles.moved}>
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

  if (account) {
    return (
      <View style={[styles.base, { flexDirection: 'row' }]}>
        <Text style={movedStyle.base}>
          <ParseEmojis
            content={account.display_name || account.username}
            emojis={account.emojis}
            size='L'
            fontBold
          />
        </Text>
        {movedContent}
      </View>
    )
  } else {
    return (
      <PlaceholderLine
        width={StyleConstants.Font.Size.L * 2}
        height={StyleConstants.Font.LineHeight.L}
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
    marginTop: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.XS
  },
  moved: {
    marginLeft: StyleConstants.Spacing.S
  }
})

export default React.memo(
  AccountInformationName,
  (_, next) => next.account === undefined
)
