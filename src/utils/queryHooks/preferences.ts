import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { getAccountStorage, setAccountStorage } from '@utils/storage/actions'

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
    initialData: getAccountStorage.object('preferences'),
    onSuccess: data => setAccountStorage('preferences', data)
  })
}

export { usePreferencesQuery }
