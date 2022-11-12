import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { QueryFunctionContext, useQuery, UseQueryOptions } from 'react-query'

export type QueryKeyStatus = ['Status', { id: Mastodon.Status['id'] }]

const queryFunction = ({ queryKey }: QueryFunctionContext<QueryKeyStatus>) => {
  const { id } = queryKey[1]

  return apiInstance<Mastodon.Status>({
    method: 'get',
    url: `statuses/${id}`
  }).then(res => res.body)
}

const useStatusQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyStatus[1] & {
  options?: UseQueryOptions<Mastodon.Status, AxiosError>
}) => {
  const queryKey: QueryKeyStatus = ['Status', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useStatusQuery }
