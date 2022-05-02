import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { QueryFunctionContext, useQuery, UseQueryOptions } from 'react-query'

export type QueryKeyStatusesHistory = [
  'StatusesHistory',
  { id: Mastodon.Status['id'] }
]

const queryFunction = async ({
  queryKey
}: QueryFunctionContext<QueryKeyStatusesHistory>) => {
  const { id } = queryKey[1]
  const res = await apiInstance<Mastodon.StatusHistory[]>({
    method: 'get',
    url: `statuses/${id}/history`
  })
  return res.body
}

const useStatusHistory = ({
  options,
  ...queryKeyParams
}: QueryKeyStatusesHistory[1] & {
  options?: UseQueryOptions<Mastodon.StatusHistory[], AxiosError>
}) => {
  const queryKey: QueryKeyStatusesHistory = [
    'StatusesHistory',
    { ...queryKeyParams }
  ]
  return useQuery(queryKey, queryFunction, options)
}

export { useStatusHistory }
