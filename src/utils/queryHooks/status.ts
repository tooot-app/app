import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'

export type QueryKeyStatus = ['Status', { id: Mastodon.Status['id'] }]

const queryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyStatus>) => {
  const { id } = queryKey[1]

  const res = await apiInstance<Mastodon.Status>({
    method: 'get',
    url: `statuses/${id}`
  })
  return res.body
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
