import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'

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

const queryFunction = async ({
  queryKey
}: QueryFunctionContext<QueryKeySearch>) => {
  const { type, term, limit = 20 } = queryKey[1]
  const res = await apiInstance<SearchResult>({
    version: 'v2',
    method: 'get',
    url: 'search',
    params: {
      ...(type && { type }),
      ...(term && { q: term }),
      limit,
      resolve: true
    }
  })
  return res.body
}

const useSearchQuery = <T = unknown>({
  options,
  ...queryKeyParams
}: QueryKeySearch[1] & {
  options?: UseQueryOptions<SearchResult, AxiosError, T>
}) => {
  const queryKey: QueryKeySearch = ['Search', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useSearchQuery }
