import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = ['Lists']

const queryFunction = async () => {
  const res = await apiInstance<Mastodon.List[]>({
    method: 'get',
    url: 'lists'
  })
  return res.body
}

const useListsQuery = ({
  options
}: {
  options?: UseQueryOptions<Mastodon.List[], AxiosError>
}) => {
  const queryKey: QueryKey = ['Lists']
  return useQuery(queryKey, queryFunction, options)
}

export { useListsQuery }
