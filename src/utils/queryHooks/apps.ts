import apiGeneral from '@api/general'
import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import * as AuthSession from 'expo-auth-session'
import {
  QueryFunctionContext,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from '@tanstack/react-query'

export type QueryKeyApps = ['Apps']

const queryFunctionApps = async ({ queryKey }: QueryFunctionContext<QueryKeyApps>) => {
  const res = await apiInstance<Mastodon.Apps>({
    method: 'get',
    url: 'apps/verify_credentials'
  })
  return res.body
}

const useAppsQuery = (
  params: {
    options?: UseQueryOptions<Mastodon.Apps, AxiosError>
  } | void
) => {
  const queryKey: QueryKeyApps = ['Apps']
  return useQuery(queryKey, queryFunctionApps, params?.options)
}

type MutationVarsApps = { domain: string }

export const redirectUri = AuthSession.makeRedirectUri({
  native: 'tooot://instance-auth',
  useProxy: false
})
const mutationFunctionApps = async ({ domain }: MutationVarsApps) => {
  const formData = new FormData()
  formData.append('client_name', 'tooot')
  formData.append('website', 'https://tooot.app')
  formData.append('redirect_uris', redirectUri)
  formData.append('scopes', 'read write follow push')

  return apiGeneral<Mastodon.Apps>({
    method: 'post',
    domain: domain,
    url: `api/v1/apps`,
    body: formData
  }).then(res => res.body)
}

const useAppsMutation = (
  options: UseMutationOptions<Mastodon.Apps, AxiosError, MutationVarsApps>
) => {
  return useMutation(mutationFunctionApps, options)
}

export { useAppsQuery, useAppsMutation }
