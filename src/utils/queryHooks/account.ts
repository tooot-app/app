import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiGeneral from '@utils/api/general'
import apiInstance from '@utils/api/instance'
import { appendRemote } from '@utils/helpers/appendRemote'
import { urlMatcher } from '@utils/helpers/urlMatcher'
import { AxiosError } from 'axios'
import { searchLocalAccount } from './search'

export type QueryKeyAccount = [
  'Account',
  (
    | (Partial<Pick<Mastodon.Account, 'id' | 'acct' | 'username' | '_remote'>> &
        Pick<Mastodon.Account, 'url'> & { _local?: boolean })
    | undefined
  )
]

const accountQueryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyAccount>) => {
  const key = queryKey[1]
  if (!key) return Promise.reject()

  let matchedAccount: Mastodon.Account | undefined = undefined

  if (key._remote) {
    const match = urlMatcher(key.url)

    const domain = match?.domain
    const id = key.id || match?.account?.id
    const acct = key.acct || key.username || match?.account?.acct

    if (!key._local && domain) {
      try {
        if (id) {
          matchedAccount = await apiGeneral<Mastodon.Account>({
            method: 'get',
            domain: domain,
            url: `api/v1/accounts/${id}`
          }).then(res => appendRemote.account(res.body))
        } else if (acct) {
          matchedAccount = await apiGeneral<Mastodon.Account>({
            method: 'get',
            domain: domain,
            url: 'api/v1/accounts/lookup',
            params: { acct }
          }).then(res => appendRemote.account(res.body))
        }
      } catch {}
    }

    if (!matchedAccount) {
      matchedAccount = await searchLocalAccount(key.url)
    }
  } else {
    if (!matchedAccount) {
      matchedAccount = await apiInstance<Mastodon.Account>({
        method: 'get',
        url: `accounts/${key.id}`
      }).then(res => res.body)
    }
  }
  return matchedAccount
}

const useAccountQuery = ({
  account,
  _local,
  options
}: {
  account?: QueryKeyAccount[1]
  _local?: boolean
  options?: UseQueryOptions<Mastodon.Account, AxiosError>
}) => {
  const queryKey: QueryKeyAccount = [
    'Account',
    account
      ? {
          id: account.id,
          username: account.username,
          url: account.url,
          _remote: account._remote,
          ...(_local && { _local })
        }
      : undefined
  ]
  return useQuery(queryKey, accountQueryFunction, {
    ...options,
    enabled: (account?._remote ? !!account : true) && options?.enabled
  })
}

/* ----- */

export type QueryKeyAccountInLists = ['AccountInLists', { id: Mastodon.Account['id'] }]

const accountInListsQueryFunction = async ({
  queryKey
}: QueryFunctionContext<QueryKeyAccountInLists>) => {
  const { id } = queryKey[1]

  const res = await apiInstance<Mastodon.List[]>({
    method: 'get',
    url: `accounts/${id}/lists`
  })
  return res.body
}

const useAccountInListsQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyAccountInLists[1] & {
  options?: UseQueryOptions<Mastodon.List[], AxiosError>
}) => {
  const queryKey: QueryKeyAccountInLists = ['AccountInLists', { ...queryKeyParams }]
  return useQuery(queryKey, accountInListsQueryFunction, options)
}

export { useAccountQuery, useAccountInListsQuery }
