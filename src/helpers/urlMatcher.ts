import { store } from '@root/store'
import { getInstanceUrl } from '@utils/slices/instancesSlice'

const matchStatus = (
  url: string
): { id: string; style: 'default' | 'pretty'; sameInstance: boolean } | null => {
  // https://social.xmflsct.com/web/statuses/105590085754428765 <- default
  // https://social.xmflsct.com/@tooot/105590085754428765 <- pretty
  const matcherStatus = new RegExp(/(https?:\/\/)?([^\/]+)\/(web\/statuses|@.+)\/([0-9]+)/)

  const matched = url.match(matcherStatus)
  if (matched) {
    const hostname = matched[2]
    const style = matched[3] === 'web/statuses' ? 'default' : 'pretty'
    const id = matched[4]

    const instanceUrl = getInstanceUrl(store.getState())
    return { id, style, sameInstance: hostname === instanceUrl }
  }

  return null
}

const matchAccount = (
  url: string
):
  | { id: string; style: 'default'; sameInstance: boolean }
  | { username: string; style: 'pretty'; sameInstance: boolean }
  | null => {
  // https://social.xmflsct.com/web/accounts/14195 <- default
  // https://social.xmflsct.com/web/@tooot <- pretty ! cannot be searched on the same instance
  // https://social.xmflsct.com/@tooot <- pretty
  const matcherAccount = new RegExp(
    /(https?:\/\/)?([^\/]+)(\/web\/accounts\/([0-9]+)|\/web\/(@.+)|\/(@.+))/
  )

  const matched = url.match(matcherAccount)
  if (matched) {
    const hostname = matched[2]
    const account = matched.filter(i => i).reverse()?.[0]
    if (account) {
      const style = account.startsWith('@') ? 'pretty' : 'default'

      const instanceUrl = getInstanceUrl(store.getState())
      return style === 'default'
        ? { id: account, style, sameInstance: hostname === instanceUrl }
        : { username: account, style, sameInstance: hostname === instanceUrl }
    } else {
      return null
    }
  }

  return null
}

export { matchStatus, matchAccount }
