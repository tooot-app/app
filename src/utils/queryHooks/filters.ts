import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

export type QueryKeyFilters = ['Filters']

const queryFunction = () =>
  apiInstance<Mastodon.Filter<'v1'>[]>({
    method: 'get',
    url: 'filters'
  }).then(res => res.body)

const useFiltersQuery = (params?: {
  options: UseQueryOptions<Mastodon.Filter<'v1'>[], AxiosError>
}) => {
  const queryKey: QueryKeyFilters = ['Filters']
  return useQuery(queryKey, queryFunction, {
    ...params?.options,
    staleTime: Infinity,
    cacheTime: Infinity
  })
}

export { useFiltersQuery }
