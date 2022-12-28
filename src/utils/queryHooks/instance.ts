import apiGeneral from '@api/general'
import { AxiosError } from 'axios'
import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiInstance from '@api/instance'

export type QueryKeyInstance = ['Instance'] | ['Instance', { domain: string }]

const queryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyInstance>) => {
  const key = queryKey[1]
  if (key?.domain) {
    return await apiGeneral<Mastodon.Instance<'v2'>>({
      method: 'get',
      domain: key.domain,
      url: 'api/v2/instance'
    })
      .then(res => res.body)
      .catch(
        async () =>
          await apiGeneral<Mastodon.Instance<'v1'>>({
            method: 'get',
            domain: key.domain,
            url: 'api/v1/instance'
          }).then(res => res.body)
      )
  } else {
    return await apiInstance<Mastodon.Instance<'v2'>>({
      method: 'get',
      version: 'v2',
      url: 'instance'
    })
      .then(res => res.body)
      .catch(
        async () =>
          await apiInstance<Mastodon.Instance<'v1'>>({
            method: 'get',
            version: 'v1',
            url: 'instance'
          }).then(res => res.body)
      )
  }
}

const useInstanceQuery = (
  params?: QueryKeyInstance[1] & {
    options?: UseQueryOptions<Mastodon.Instance<any>, AxiosError>
  }
) => {
  const queryKey: QueryKeyInstance = params?.domain ? ['Instance', params] : ['Instance']
  return useQuery(queryKey, queryFunction, {
    ...params?.options,
    staleTime: Infinity,
    cacheTime: Infinity
  })
}

export { useInstanceQuery }
