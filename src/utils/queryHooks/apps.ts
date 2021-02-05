import client from '@api/client'
import { AxiosError } from 'axios'
import * as AuthSession from 'expo-auth-session'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = ['Apps', { instanceDomain?: string }]

const queryFunction = ({ queryKey }: { queryKey: QueryKey }) => {
  const redirectUri = AuthSession.makeRedirectUri({
    native: 'tooot://instance-auth',
    useProxy: false
  })

  const { instanceDomain } = queryKey[1]

  const formData = new FormData()
  formData.append('client_name', 'tooot')
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
