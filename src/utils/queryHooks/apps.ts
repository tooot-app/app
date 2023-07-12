import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiGeneral from '@utils/api/general'
import apiInstance from '@utils/api/instance'
import { AxiosError } from 'axios'
import * as AuthSession from 'expo-auth-session'

export type QueryKeyApps = ['Apps']

const queryFunctionApps = async () => {
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

type MutationVarsApps = { domain: string; scopes: string[] }

export const redirectUri = AuthSession.makeRedirectUri({ native: 'tooot://instance-auth' })
const mutationFunctionApps = async ({ domain, scopes }: MutationVarsApps) => {
  return apiGeneral<Mastodon.Apps>({
    method: 'post',
    domain: domain,
    url: 'api/v1/apps',
    body: {
      client_name: 'tooot',
      website: 'https://tooot.app',
      redirect_uris: redirectUri,
      scopes: scopes.join(' ')
    }
  }).then(res => res.body)
}

const useAppsMutation = (
  options: UseMutationOptions<Mastodon.Apps, AxiosError, MutationVarsApps>
) => {
  return useMutation(mutationFunctionApps, options)
}

export { useAppsMutation, useAppsQuery }

