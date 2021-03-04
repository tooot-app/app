import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = [
  'Search',
  {
    type?: 'accounts' | 'hashtags' | 'statuses'
    term?: string
    limit?: number
  }
]

type SearchResult = {
  accounts: Mastodon.Account[]
  hashtags: Mastodon.Tag[]
  statuses: Mastodon.Status[]
}

const queryFunction = ({ queryKey }: { queryKey: QueryKey }) => {
  const { type, term, limit = 20 } = queryKey[1]
  return apiInstance<SearchResult>({
    version: 'v2',
    method: 'get',
    url: 'search',
    params: { ...(type && { type }), ...(term && { q: term }), limit }
  }).then(res => res.body)
}

const useSearchQuery = <TData = SearchResult>({
  options,
  ...queryKeyParams
}: QueryKey[1] & {
  options?: UseQueryOptions<SearchResult, AxiosError, TData>
}) => {
  const queryKey: QueryKey = ['Search', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useSearchQuery }
