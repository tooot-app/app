import Input from '@components/Input'
import { ParseEmojis } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { PlaceholderLine } from 'rn-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
  edit?: boolean // Editing mode
}

const AccountInformationName: React.FC<Props> = ({ account, edit }) => {
  const { theme } = useTheme()

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

  const [displatName, setDisplayName] = useState(account?.display_name)

  return (
    <View style={[styles.base, { flexDirection: 'row' }]}>
      {account ? (
        edit ? (
          <Input title='昵称' value={displatName} setValue={setDisplayName} />
        ) : (
          <>
            <Text
              style={{
                textDecorationLine: account?.moved ? 'line-through' : undefined
              }}
            >
              <ParseEmojis
                content={account.display_name || account.username}
                emojis={account.emojis}
                size='L'
                fontBold
              />
            </Text>
            {movedContent}
          </>
        )
      ) : (
        <PlaceholderLine
          width={StyleConstants.Font.Size.L * 2}
          height={StyleConstants.Font.LineHeight.L}
          color={theme.shimmerDefault}
          noMargin
          style={{ borderRadius: 0 }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 0,
    marginTop: StyleConstants.Spacing.S,
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
