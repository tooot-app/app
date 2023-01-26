import haptics from '@components/haptics'
import { QueryFunctionContext, useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query'
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

/* ----- */

type MutationVarsFilter = { filter: Mastodon.Filter<'v2'> } & (
  | { source: 'status'; action: 'add'; status: Mastodon.Status }
  | { source: 'status'; action: 'remove'; status: Mastodon.Status }
  | { source: 'keyword'; action: 'add'; keyword: string }
  | { source: 'keyword'; action: 'remove'; keyword: string }
)

const mutationFunction = async (params: MutationVarsFilter) => {
  switch (params.source) {
    case 'status':
      switch (params.action) {
        case 'add':
          return apiInstance({
            method: 'post',
            version: 'v2',
            url: `filters/${params.filter.id}/statuses`,
            body: { status_id: params.status.id }
          })
        case 'remove':
          for (const status of params.filter.statuses) {
            if (status.status_id === params.status.id) {
              await apiInstance({
                method: 'delete',
                version: 'v2',
                url: `filters/statuses/${status.id}`
              })
            }
          }
          return Promise.resolve()
      }
      break
    case 'keyword':
      switch (params.action) {
        case 'add':
          return apiInstance({
            method: 'post',
            version: 'v2',
            url: `filters/${params.filter.id}/keywords`,
            body: { keyword: params.keyword, whole_word: true }
          })
        case 'remove':
          for (const keyword of params.filter.keywords) {
            if (keyword.keyword === params.keyword) {
              await apiInstance({
                method: 'delete',
                version: 'v2',
                url: `filters/keywords/${keyword.id}`
              })
            }
          }
          return Promise.resolve()
      }
      break
  }
}

const useFilterMutation = () => {
  return useMutation<any, AxiosError, MutationVarsFilter>(mutationFunction, {
    onSuccess: () => haptics('Light'),
    onError: () => haptics('Error')
  })
}

/* ----- */

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

export { useFilterQuery, useFilterMutation, useFiltersQuery }
