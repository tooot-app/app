import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiGeneral from '@utils/api/general'
import apiInstance from '@utils/api/instance'
import { urlMatcher } from '@utils/helpers/urlMatcher'
import { AxiosError } from 'axios'

export type QueryKeyStatusesHistory = [
  'StatusesHistory',
  Pick<Mastodon.Status, 'id' | 'uri' | 'edited_at' | '_remote'> &
    Partial<Pick<Mastodon.Status, 'edited_at'>>
]

const queryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyStatusesHistory>) => {
  const { id, uri, _remote } = queryKey[1]

  if (_remote) {
    const match = urlMatcher(uri)
    const domain = match?.domain
    if (!domain) {
      return Promise.reject('Cannot find remote domain to retrieve status histories')
    }
    return await apiGeneral<Mastodon.StatusHistory[]>({
      method: 'get',
      domain,
      url: `api/v1/statuses/${id}/history`
    }).then(res => res.body)
  }

  return await apiInstance<Mastodon.StatusHistory[]>({
    method: 'get',
    url: `statuses/${id}/history`
  }).then(res => res.body)
}

const useStatusHistory = ({
  options,
  status
}: { status: QueryKeyStatusesHistory[1] } & {
  options?: UseQueryOptions<Mastodon.StatusHistory[], AxiosError>
}) => {
  const queryKey: QueryKeyStatusesHistory = [
    'StatusesHistory',
    { id: status.id, uri: status.uri, edited_at: status.edited_at, _remote: status._remote }
  ]
  return useQuery(queryKey, queryFunction, {
    ...options,
    enabled: !!status.edited_at,
    staleTime: 3600,
    cacheTime: 3600
  })
}

export { useStatusHistory }
