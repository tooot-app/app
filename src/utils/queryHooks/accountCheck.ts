import client from '@api/client'
import { InstancesState } from '@utils/slices/instancesSlice'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = [
  'AccountCheck',
  {
    id: Mastodon.Account['id']
    index: NonNullable<InstancesState['local']['activeIndex']>
  }
]

const queryFunction = async ({ queryKey }: { queryKey: QueryKey }) => {
  const { id, index } = queryKey[1]

  return client<Mastodon.Account>({
    method: 'get',
    instance: 'local',
    localIndex: index,
    url: `accounts/${id}`
  }).then(res => res.body)
}

const useAccountCheckQuery = <TData = Mastodon.Account>({
  options,
  ...queryKeyParams
}: QueryKey[1] & {
  options?: UseQueryOptions<Mastodon.Account, AxiosError, TData>
}) => {
  const queryKey: QueryKey = ['AccountCheck', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useAccountCheckQuery }
