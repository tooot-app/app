import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiGeneral from '@utils/api/general'
import { AxiosError } from 'axios'

export type QueryKeyNeodb = ['Neodb', { path: string }]

const queryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyNeodb>) =>
  apiGeneral({
    method: 'get',
    domain: 'neodb.social',
    url: `/api/${queryKey[1].path}`
  }).then(res => res.body)

export const useNeodbQuery = (
  params: QueryKeyNeodb[1] & {
    options?: UseQueryOptions<any, AxiosError>
  }
) => {
  const queryKey: QueryKeyNeodb = ['Neodb', { path: params.path }]
  return useQuery(queryKey, queryFunction, {
    ...params?.options,
    staleTime: Infinity,
    cacheTime: Infinity
  })
}
