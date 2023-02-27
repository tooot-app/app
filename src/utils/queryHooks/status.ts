import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiGeneral from '@utils/api/general'
import apiInstance from '@utils/api/instance'
import { appendRemote } from '@utils/helpers/appendRemote'
import { urlMatcher } from '@utils/helpers/urlMatcher'
import { AxiosError } from 'axios'
import { searchLocalStatus } from './search'

export type QueryKeyStatus = [
  'Status',
  (Pick<Mastodon.Status, 'uri'> & Partial<Pick<Mastodon.Status, 'id' | '_remote'>>) | undefined
]

const queryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyStatus>) => {
  const key = queryKey[1]
  if (!key) return Promise.reject()

  let matchedStatus: Mastodon.Status | undefined = undefined

  const match = urlMatcher(key.uri)
  const domain = match?.domain
  const id = key.id || match?.status?.id

  if (key._remote && domain && id) {
    try {
      matchedStatus = await apiGeneral<Mastodon.Status>({
        method: 'get',
        domain,
        url: `api/v1/statuses/${id}`
      }).then(res => appendRemote.status(res.body, domain))
    } catch {}
  }

  if (!matchedStatus && !key._remote && id) {
    matchedStatus = await apiInstance<Mastodon.Status>({
      method: 'get',
      url: `statuses/${id}`
    }).then(res => res.body)
  }

  if (!matchedStatus) {
    matchedStatus = await searchLocalStatus(key.uri)
  }

  return matchedStatus
}

const useStatusQuery = ({
  options,
  status
}: { status?: QueryKeyStatus[1] } & {
  options?: UseQueryOptions<Mastodon.Status, AxiosError>
}) => {
  const queryKey: QueryKeyStatus = [
    'Status',
    status ? { id: status.id, uri: status.uri, _remote: status._remote } : undefined
  ]
  return useQuery(queryKey, queryFunction, options)
}

export { useStatusQuery }
