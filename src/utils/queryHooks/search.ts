import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiInstance from '@utils/api/instance'
import { queryClient } from '@utils/queryHooks'
import { AxiosError } from 'axios'

export type QueryKeySearch = [
  'Search',
  {
    type?: 'accounts' | 'hashtags' | 'statuses'
    term?: string
    limit?: number
  }
]

export type SearchResult = {
  accounts: Mastodon.Account[]
  hashtags: Mastodon.Tag[]
  statuses: Mastodon.Status[]
}

const queryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeySearch>) => {
  const { type, term, limit = 20 } = queryKey[1]
  if (!term?.length) {
    return Promise.reject('Empty search term')
  }
  const res = await apiInstance<SearchResult>({
    version: 'v2',
    method: 'get',
    url: 'search',
    params: {
      q: term,
      ...(type && { type }),
      limit,
      resolve: true
    }
  })
  return res.body
}

const useSearchQuery = <T = SearchResult>({
  options,
  ...queryKeyParams
}: QueryKeySearch[1] & {
  options?: UseQueryOptions<SearchResult, AxiosError, T>
}) => {
  const queryKey: QueryKeySearch = ['Search', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, { ...options, staleTime: 3600, cacheTime: 3600 })
}

export const searchLocalStatus = async (uri: Mastodon.Status['uri']): Promise<Mastodon.Status> => {
  const queryKey: QueryKeySearch = ['Search', { type: 'statuses', term: uri, limit: 1 }]
  return await queryClient
    .fetchQuery(queryKey, queryFunction, { staleTime: 3600, cacheTime: 3600 })
    .then(res =>
      res.statuses[0]?.uri === uri || res.statuses[0]?.url === uri
        ? res.statuses[0]
        : Promise.reject()
    )
}

export const searchLocalAccount = async (
  url: Mastodon.Account['url']
): Promise<Mastodon.Account> => {
  const queryKey: QueryKeySearch = ['Search', { type: 'accounts', term: url, limit: 1 }]
  return await queryClient
    .fetchQuery(queryKey, queryFunction, { staleTime: 3600, cacheTime: 3600 })
    .then(res => (res.accounts[0].url === url ? res.accounts[0] : Promise.reject()))
}

export { useSearchQuery }
