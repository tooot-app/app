import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { QueryFunctionContext, useQuery, UseQueryOptions } from 'react-query'

export type QueryKeyAccount = ['Account', { id: Mastodon.Account['id'] }]

const accountQueryFunction = ({ queryKey }: QueryFunctionContext<QueryKeyAccount>) => {
  const { id } = queryKey[1]

  return apiInstance<Mastodon.Account>({
    method: 'get',
    url: `accounts/${id}`
  }).then(res => res.body)
}

const useAccountQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyAccount[1] & {
  options?: UseQueryOptions<Mastodon.Account, AxiosError>
}) => {
  const queryKey: QueryKeyAccount = ['Account', { ...queryKeyParams }]
  return useQuery(queryKey, accountQueryFunction, options)
}

/* ----- */

export type QueryKeyAccountInLists = ['AccountInLists', { id: Mastodon.Account['id'] }]

const accountInListsQueryFunction = ({
  queryKey
}: QueryFunctionContext<QueryKeyAccountInLists>) => {
  const { id } = queryKey[1]

  return apiInstance<Mastodon.List[]>({
    method: 'get',
    url: `accounts/${id}/lists`
  }).then(res => res.body)
}

const useAccountInListsQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyAccount[1] & {
  options?: UseQueryOptions<Mastodon.List[], AxiosError>
}) => {
  const queryKey: QueryKeyAccountInLists = ['AccountInLists', { ...queryKeyParams }]
  return useQuery(queryKey, accountInListsQueryFunction, options)
}

export { useAccountQuery, useAccountInListsQuery }
