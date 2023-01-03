import { getAccountStorage } from '@utils/storage/actions'
import parse from 'url-parse'

export const urlMatcher = (
  url: string
):
  | {
      domain: string
      account?: Partial<Pick<Mastodon.Account, 'id' | 'acct' | '_remote'>>
      status?: Partial<Pick<Mastodon.Status, 'id' | '_remote'>>
    }
  | undefined => {
  const parsed = parse(url)
  if (!parsed.hostname.length || !parsed.pathname.length) return undefined

  const domain = parsed.hostname
  const _remote = parsed.hostname !== getAccountStorage.string('auth.domain')

  let statusId: string | undefined
  let accountId: string | undefined
  let accountAcct: string | undefined

  const segments = parsed.pathname.split('/')
  const last = segments[segments.length - 1]
  const length = segments.length // there is a starting slash

  switch (last?.startsWith('@')) {
    case true:
      if (length === 2 || (length === 3 && segments[length - 2] === 'web')) {
        // https://social.xmflsct.com/@tooot <- Mastodon v4.0 and above
        // https://social.xmflsct.com/web/@tooot <- Mastodon v3.5 and below ! cannot be searched on the same instance
        accountAcct = `${last}@${domain}`
      }
      break
    case false:
      const nextToLast = segments[length - 2]
      if (nextToLast) {
        if (nextToLast === 'statuses') {
          if (length === 4 && segments[length - 3] === 'web') {
            // https://social.xmflsct.com/web/statuses/105590085754428765 <- old
            statusId = last
          } else if (
            length === 5 &&
            segments[length - 2] === 'statuses' &&
            segments[length - 4] === 'users'
          ) {
            // https://social.xmflsct.com/users/tooot/statuses/105590085754428765 <- default Mastodon
            statusId = last
            // accountAcct = `@${segments[length - 3]}@${domain}`
          }
        } else if (
          nextToLast.startsWith('@') &&
          (length === 3 || (length === 4 && segments[length - 3] === 'web'))
        ) {
          // https://social.xmflsct.com/web/@tooot/105590085754428765 <- pretty Mastodon v3.5 and below
          // https://social.xmflsct.com/@tooot/105590085754428765 <- pretty Mastodon v4.0 and above
          statusId = last
          // accountAcct = `${nextToLast}@${domain}`
        }
      }
      break
  }

  return {
    domain,
    ...((accountId || accountAcct) && { account: { id: accountId, acct: accountAcct, _remote } }),
    ...(statusId && { status: { id: statusId, _remote } })
  }
}
