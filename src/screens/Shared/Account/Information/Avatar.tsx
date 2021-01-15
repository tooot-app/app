import GracefullyImage from '@components/GracefullyImage'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationAvatar = React.memo(
  ({ account }: Props) => {
    return (
      <GracefullyImage
        uri={{ original: account?.avatar }}
        dimension={{
          width: StyleConstants.Avatar.L,
          height: StyleConstants.Avatar.L
        }}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      />
    )
  },
  (_, next) => next.account === undefined
)

export default AccountInformationAvatar
