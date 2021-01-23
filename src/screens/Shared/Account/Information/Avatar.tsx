import GracefullyImage from '@components/GracefullyImage'
import { StyleConstants } from '@utils/styles/constants'
import React, { useMemo } from 'react'
import { StyleSheet } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationAvatar: React.FC<Props> = ({ account }) => {
  const dimension = useMemo(
    () => ({
      width: StyleConstants.Avatar.L,
      height: StyleConstants.Avatar.L
    }),
    []
  )

  return (
    <GracefullyImage
      style={styles.base}
      uri={{ original: account?.avatar }}
      dimension={dimension}
    />
  )
}

const styles = StyleSheet.create({
  base: { borderRadius: 8, overflow: 'hidden' }
})

export default AccountInformationAvatar
