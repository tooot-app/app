import client from '@api/client'
import { AxiosError } from 'axios'
import Constants from 'expo-constants'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = ['Apps', { instanceDomain?: string }]

const queryFunction = ({ queryKey }: { queryKey: QueryKey }) => {
  let redirectUri: string
  switch (Constants.manifest.releaseChannel) {
    case 'production':
    case 'staging':
    case 'testing':
      redirectUri = 'tooot://expo-auth-session'
      break
    default:
      redirectUri = 'exp://127.0.0.1:19000'
      break
  }

  const { instanceDomain } = queryKey[1]

  const formData = new FormData()
  formData.append('client_name', 'tooot📱')
  formData.append('website', 'https://tooot.app')
  formData.append('redirect_uris', redirectUri)
  formData.append('scopes', 'read write follow push')

  return client<Mastodon.Apps>({
    method: 'post',
    instance: 'remote',
    instanceDomain,
    url: `apps`,
    body: formData
  })
}

const useAppsQuery = <TData = Mastodon.Apps>({
  options,
  ...queryKeyParams
}: QueryKey[1] & {
  options?: UseQueryOptions<Mastodon.Apps, AxiosError, TData>
}) => {
  const queryKey: QueryKey = ['Apps', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useAppsQuery }
