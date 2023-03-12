import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiGeneral from '@utils/api/general'
import apiInstance from '@utils/api/instance'
import { featureCheck } from '@utils/helpers/featureCheck'
import { setAccountStorage } from '@utils/storage/actions'
import { AxiosError } from 'axios'

export type QueryKeyInstance = ['Instance'] | ['Instance', { domain?: string }]

const queryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyInstance>) => {
  const domain = queryKey[1]?.domain

  const checkV2Format = (body: Mastodon.Instance_V2) => {
    if (body.version) {
      return body
    } else {
      throw new Error('Instance v2 format error')
    }
  }

  if (domain) {
    return await apiGeneral<Mastodon.Instance<'v2'>>({
      method: 'get',
      domain,
      url: 'api/v2/instance'
    })
      .then(res => checkV2Format(res.body))
      .catch(
        async () =>
          await apiGeneral<Mastodon.Instance<'v1'>>({
            method: 'get',
            domain,
            url: 'api/v1/instance'
          }).then(res => res.body)
      )
  } else {
    const hasInstanceNewPath = featureCheck('instance_new_path')
    return hasInstanceNewPath
      ? await apiInstance<Mastodon.Instance<'v2'>>({
          method: 'get',
          version: 'v2',
          url: 'instance'
        })
          .then(res => checkV2Format(res.body))
          .catch(
            async () =>
              await apiInstance<Mastodon.Instance<'v1'>>({
                method: 'get',
                version: 'v1',
                url: 'instance'
              }).then(res => res.body)
          )
      : await apiInstance<Mastodon.Instance<'v1'>>({
          method: 'get',
          version: 'v1',
          url: 'instance'
        }).then(res => res.body)
  }
}

const useInstanceQuery = (
  params?: QueryKeyInstance[1] & {
    options?: UseQueryOptions<Mastodon.Instance<any>, AxiosError>
  }
) => {
  const queryKey: QueryKeyInstance = params?.domain
    ? ['Instance', { domain: params.domain }]
    : ['Instance']
  return useQuery(queryKey, queryFunction, {
    ...params?.options,
    staleTime: Infinity,
    cacheTime: Infinity,
    ...(!params?.domain && {
      onSuccess: data => setAccountStorage([{ key: 'version', value: data.version }])
    })
  })
}

export { useInstanceQuery }
