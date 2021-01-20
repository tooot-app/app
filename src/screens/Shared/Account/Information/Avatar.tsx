import GracefullyImage from '@components/GracefullyImage'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { StyleSheet } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationAvatar = React.memo(
  ({ account }: Props) => {
    return (
      <GracefullyImage
        style={styles.base}
        uri={{ original: account?.avatar }}
        dimension={{
          width: StyleConstants.Avatar.L,
          height: StyleConstants.Avatar.L
        }}
      />
    )
  },
  (_, next) => next.account === undefined
)

const styles = StyleSheet.create({
  base: { borderRadius: 8, overflow: 'hidden' }
})

export default AccountInformationAvatar
