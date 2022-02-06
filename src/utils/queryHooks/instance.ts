import apiGeneral from '@api/general'
import { AxiosError } from 'axios'
import { QueryFunctionContext, useQuery, UseQueryOptions } from 'react-query'

export type QueryKeyInstance = ['Instance', { domain?: string }]

const queryFunction = async ({
  queryKey
}: QueryFunctionContext<QueryKeyInstance>) => {
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

const useInstanceQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyInstance[1] & {
  options?: UseQueryOptions<
    Mastodon.Instance & { publicAllow?: boolean },
    AxiosError
  >
}) => {
  const queryKey: QueryKeyInstance = ['Instance', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useInstanceQuery }
