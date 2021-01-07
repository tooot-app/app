import client from '@api/client'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = ['Account', { id: Mastodon.Account['id'] }]

const queryFunction = ({ queryKey }: { queryKey: QueryKey }) => {
  const { id } = queryKey[1]

  return client<Mastodon.Account>({
    method: 'get',
    instance: 'local',
    url: `accounts/${id}`
  })
}

const hookAccount = <TData = Mastodon.Account>({
  options,
  ...queryKeyParams
}: QueryKey[1] & {
  options?: UseQueryOptions<Mastodon.Account, AxiosError, TData>
}) => {
  const queryKey: QueryKey = ['Account', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export default hookAccount
