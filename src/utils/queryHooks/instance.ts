import client from '@api/client'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = ['Instance', { instanceDomain?: string }]

const queryFunction = ({ queryKey }: { queryKey: QueryKey }) => {
  const { instanceDomain } = queryKey[1]

  return client<Mastodon.Instance>({
    method: 'get',
    instance: 'remote',
    instanceDomain,
    url: `instance`
  })
}

const useInstanceQuery = <
  TData = Mastodon.Instance & { publicAllow?: boolean }
>({
  options,
  ...queryKeyParams
}: QueryKey[1] & {
  options?: UseQueryOptions<
    Mastodon.Instance & { publicAllow?: boolean },
    AxiosError,
    TData
  >
}) => {
  const queryKey: QueryKey = ['Instance', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useInstanceQuery }
