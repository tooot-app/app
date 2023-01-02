import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiInstance from '@utils/api/instance'
import { AxiosError } from 'axios'
import { SearchResult } from './search'

export type QueryKeyAccount = ['Account', { id?: Mastodon.Account['id']; remoteUrl?: string }]

const accountQueryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyAccount>) => {
  const { id, remoteUrl } = queryKey[1]
  if (!id && !remoteUrl) return Promise.reject()

  let matchedId = id

  if (remoteUrl) {
    await apiInstance<SearchResult>({
      version: 'v2',
      method: 'get',
      url: 'search',
      params: {
        q: remoteUrl,
        type: 'accounts',
        limit: 1,
        resolve: true
      }
    })
      .then(res => {
        const account = res.body.accounts[0]
        if (account.url !== remoteUrl) {
          return Promise.reject()
        } else {
          matchedId = account.id
        }
      })
      .catch(() => Promise.reject())
  }

  const res = await apiInstance<Mastodon.Account>({
    method: 'get',
    url: `accounts/${matchedId}`
  })
  return res.body
}

const useAccountQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyAccount[1] & {
  options?: UseQueryOptions<Mastodon.Account, AxiosError>
}) => {
  const queryKey: QueryKeyAccount = ['Account', { ...queryKeyParams }]
  return useQuery(queryKey, accountQueryFunction, { ...options })
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
