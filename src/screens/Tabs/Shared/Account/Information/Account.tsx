import Icon from '@components/Icon'
import {
  getInstanceAccount,
  getInstanceUri
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { PlaceholderLine } from 'rn-placeholder'

export interface Props {
  account: Mastodon.Account | undefined
  localInstance: boolean
}

const AccountInformationAccount: React.FC<Props> = ({
  account,
  localInstance
}) => {
  const { colors } = useTheme()
  const instanceAccount = useSelector(
    getInstanceAccount,
    (prev, next) => prev?.acct === next?.acct
  )
  const instanceUri = useSelector(getInstanceUri)

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
        <Text
          style={[
            styles.moved,
            { color: colors.secondary, ...StyleConstants.FontStyle.M }
          ]}
          selectable
        >
          @{account.moved.acct}
        </Text>
      )
    }
  }, [account?.moved])

  if (account || (localInstance && instanceAccount)) {
    return (
      <View
        style={[styles.base, { flexDirection: 'row', alignItems: 'center' }]}
      >
        <Text
          style={[
            movedStyle.base,
            {
              color: colors.secondary,
              ...StyleConstants.FontStyle.M
            }
          ]}
          selectable
        >
          @{localInstance ? instanceAccount?.acct : account?.acct}
          {localInstance ? `@${instanceUri}` : null}
        </Text>
        {movedContent}
        {account?.locked ? (
          <Icon
            name='Lock'
            style={styles.type}
            color={colors.secondary}
            size={StyleConstants.Font.Size.M}
          />
        ) : null}
        {account?.bot ? (
          <Icon
            name='HardDrive'
            style={styles.type}
            color={colors.secondary}
            size={StyleConstants.Font.Size.M}
          />
        ) : null}
      </View>
    )
  } else {
    return (
      <PlaceholderLine
        width={StyleConstants.Font.Size.M * 3}
        height={StyleConstants.Font.LineHeight.M}
        color={colors.shimmerDefault}
        noMargin
        style={styles.base}
      />
    )
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 0,
    marginBottom: StyleConstants.Spacing.L
  },
  type: { marginLeft: StyleConstants.Spacing.S },
  moved: {
    marginLeft: StyleConstants.Spacing.S
  }
})

export default React.memo(
  AccountInformationAccount,
  (_, next) => next.account === undefined
)
