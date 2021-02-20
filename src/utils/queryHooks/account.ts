import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = ['Account', { id: Mastodon.Account['id'] }]

const queryFunction = ({ queryKey }: { queryKey: QueryKey }) => {
  const { id } = queryKey[1]

  return apiInstance<Mastodon.Account>({
    method: 'get',
    url: `accounts/${id}`
  }).then(res => res.body)
}

const useAccountQuery = <TData = Mastodon.Account>({
  options,
  ...queryKeyParams
}: QueryKey[1] & {
  options?: UseQueryOptions<Mastodon.Account, AxiosError, TData>
}) => {
  const queryKey: QueryKey = ['Account', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useAccountQuery }
