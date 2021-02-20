import apiGeneral from '@api/general'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = ['Instance', { domain?: string }]

const queryFunction = async ({ queryKey }: { queryKey: QueryKey }) => {
  const { domain } = queryKey[1]
  if (!domain) {
    return Promise.reject()
  }

  const res = await apiGeneral<Mastodon.Instance>({
    method: 'get',
    domain: domain,
    url: `api/v1/instance`
  })
  return res.body
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
