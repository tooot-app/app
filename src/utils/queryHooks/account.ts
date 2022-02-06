import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { QueryFunctionContext, useQuery, UseQueryOptions } from 'react-query'

export type QueryKeyAccount = ['Account', { id: Mastodon.Account['id'] }]

const queryFunction = ({ queryKey }: QueryFunctionContext<QueryKeyAccount>) => {
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
  return useQuery(queryKey, queryFunction, options)
}

export { useAccountQuery }
