import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiInstance from '@utils/api/instance'
import { getAccountStorage, setAccountStorage } from '@utils/storage/actions'
import { AxiosError } from 'axios'

export type QueryKeyPreferences = ['Preferences']

const queryFunction = () =>
  apiInstance<Mastodon.Preferences>({
    method: 'get',
    url: 'preferences'
  }).then(res => res.body)

const usePreferencesQuery = (params?: {
  options: UseQueryOptions<Mastodon.Preferences, AxiosError>
}) => {
  const queryKey: QueryKeyPreferences = ['Preferences']
  return useQuery(queryKey, queryFunction, {
    ...params?.options,
    staleTime: Infinity,
    cacheTime: Infinity,
    placeholderData: getAccountStorage.object('preferences'),
    onSuccess: data => setAccountStorage([{ key: 'preferences', value: data }])
  })
}

export { usePreferencesQuery }
