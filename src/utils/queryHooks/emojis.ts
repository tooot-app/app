import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

type QueryKey = ['Emojis']

const queryFunction = () => {
  return apiInstance<Mastodon.Emoji[]>({
    method: 'get',
    url: 'custom_emojis'
  }).then(res => res.body)
}

const useEmojisQuery = <TData = Mastodon.Emoji[]>({
  options
}: {
  options?: UseQueryOptions<Mastodon.Emoji[], AxiosError, TData>
}) => {
  const queryKey: QueryKey = ['Emojis']
  return useQuery(queryKey, queryFunction, options)
}

export { useEmojisQuery }
