import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

type QueryKeyEmojis = ['Emojis']

const queryFunction = async () => {
  const res = await apiInstance<Mastodon.Emoji[]>({
    method: 'get',
    url: 'custom_emojis'
  })
  return res.body
}

const useEmojisQuery = ({
  options
}: {
  options?: UseQueryOptions<Mastodon.Emoji[], AxiosError>
}) => {
  const queryKey: QueryKeyEmojis = ['Emojis']
  return useQuery(queryKey, queryFunction, options)
}

export { useEmojisQuery }
