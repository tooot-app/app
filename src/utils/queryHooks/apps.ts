import apiGeneral from '@api/general'
import { AxiosError } from 'axios'
import * as AuthSession from 'expo-auth-session'
import { QueryFunctionContext, useQuery, UseQueryOptions } from 'react-query'

export type QueryKeyApps = ['Apps', { domain?: string }]

const queryFunction = ({ queryKey }: QueryFunctionContext<QueryKeyApps>) => {
  const redirectUri = AuthSession.makeRedirectUri({
    native: 'tooot://instance-auth',
    useProxy: false
  })

  const { domain } = queryKey[1]

  const formData = new FormData()
  formData.append('client_name', 'tooot')
  formData.append('website', 'https://tooot.app')
  formData.append('redirect_uris', redirectUri)
  formData.append('scopes', 'read write follow push')

  return apiGeneral<Mastodon.Apps>({
    method: 'post',
    domain: domain || '',
    url: `api/v1/apps`,
    body: formData
  }).then(res => res.body)
}

const useAppsQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyApps[1] & {
  options?: UseQueryOptions<Mastodon.Apps, AxiosError>
}) => {
  const queryKey: QueryKeyApps = ['Apps', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useAppsQuery }
