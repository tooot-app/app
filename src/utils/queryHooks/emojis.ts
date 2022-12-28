import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiInstance from '@utils/api/instance'
import { getAccountStorage, setAccountStorage } from '@utils/storage/actions'
import { AxiosError } from 'axios'

type QueryKeyEmojis = ['Emojis']

const queryFunction = async () => {
  const res = await apiInstance<Mastodon.Emoji[]>({
    method: 'get',
    url: 'custom_emojis'
  })
  return res.body
}

const useEmojisQuery = (params?: { options?: UseQueryOptions<Mastodon.Emoji[], AxiosError> }) => {
  const queryKey: QueryKeyEmojis = ['Emojis']
  return useQuery(queryKey, queryFunction, {
    ...params?.options,
    staleTime: Infinity,
    cacheTime: Infinity,
    onSuccess: data => {
      if (!data.length) return

      const currEmojis = getAccountStorage.object('emojis_frequent')
      if (!Array.isArray(currEmojis)) {
        setAccountStorage('emojis_frequent', [])
      } else {
        setAccountStorage(
          'emojis_frequent',
          currEmojis?.filter(emoji => {
            return data.find(e => e.shortcode === emoji.emoji.shortcode)
          })
        )
      }
    }
  })
}

export { useEmojisQuery }
