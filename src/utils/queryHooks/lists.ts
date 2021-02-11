import client from '@api/client'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = ['Lists']

const queryFunction = () => {
  return client<Mastodon.List[]>({
    method: 'get',
    instance: 'local',
    url: 'lists'
  }).then(res => res.body)
}

const useListsQuery = <TData = Mastodon.List[]>({
  options
}: {
  options?: UseQueryOptions<Mastodon.List[], AxiosError, TData>
}) => {
  const queryKey: QueryKey = ['Lists']
  return useQuery(queryKey, queryFunction, options)
}

export { useListsQuery }
