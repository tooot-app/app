import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = ['Push']

const queryFunction = async () => {
  const res = await apiInstance<Mastodon.PushSubscription>({
    method: 'get',
    url: 'push/subscription'
  })
  return res.body
}

const usePushQuery = <TData = Mastodon.PushSubscription>({
  options
}: {
  options?: UseQueryOptions<Mastodon.PushSubscription, AxiosError, TData>
}) => {
  const queryKey: QueryKey = ['Push']
  return useQuery(queryKey, queryFunction, options)
}

export { usePushQuery }
