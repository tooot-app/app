import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiInstance from '@utils/api/instance'
import { AxiosError } from 'axios'

export type QueryKeyFilter = ['Filter', { id: Mastodon.Filter<'v2'>['id'] }]

const filterQueryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyFilter>) => {
  const res = await apiInstance<Mastodon.Filter<'v2'>>({
    method: 'get',
    version: 'v2',
    url: `filters/${queryKey[1].id}`
  })
  return res.body
}

const useFilterQuery = ({
  filter,
  options
}: {
  filter: Mastodon.Filter<'v2'>
  options?: UseQueryOptions<Mastodon.Filter<'v2'>, AxiosError>
}) => {
  const queryKey: QueryKeyFilter = ['Filter', { id: filter.id }]
  return useQuery(queryKey, filterQueryFunction, {
    ...options,
    staleTime: Infinity,
    cacheTime: Infinity
  })
}

export type QueryKeyFilters = ['Filters', { version: 'v1' | 'v2' }]

const filtersQueryFunction = async <T extends 'v1' | 'v2' = 'v1'>({
  queryKey
}: QueryFunctionContext<QueryKeyFilters>) => {
  const version = queryKey[1].version
  const res = await apiInstance<Mastodon.Filter<T>[]>({
    method: 'get',
    version,
    url: 'filters'
  })
  return res.body
}

const useFiltersQuery = <T extends 'v1' | 'v2' = 'v1'>(params?: {
  version?: T
  options?: UseQueryOptions<Mastodon.Filter<T>[], AxiosError>
}) => {
  const queryKey: QueryKeyFilters = ['Filters', { version: params?.version || 'v1' }]
  return useQuery(queryKey, filtersQueryFunction, {
    ...params?.options,
    staleTime: Infinity,
    cacheTime: Infinity
  })
}

export { useFilterQuery, useFiltersQuery }
