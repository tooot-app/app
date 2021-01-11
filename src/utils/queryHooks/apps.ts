import client from '@api/client'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = ['Apps', { instanceDomain?: string }]

const queryFunction = ({ queryKey }: { queryKey: QueryKey }) => {
  const { instanceDomain } = queryKey[1]

  const formData = new FormData()
  formData.append('client_name', 'test_dudu')
  formData.append('redirect_uris', 'exp://127.0.0.1:19000')
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
