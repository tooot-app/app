import apiInstance, { InstanceResponse } from '@api/instance'
import { TabSharedStackParamList } from '@utils/navigation/navigators'
import { AxiosError } from 'axios'
import {
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions
} from '@tanstack/react-query'

export type QueryKeyUsers = [
  'Users',
  TabSharedStackParamList['Tab-Shared-Users']
]

const queryFunction = ({
  queryKey,
  pageParam
}: QueryFunctionContext<QueryKeyUsers>) => {
  const { reference, id, type } = queryKey[1]
  let params: { [key: string]: string } = { ...pageParam }

  return apiInstance<Mastodon.Account[]>({
    method: 'get',
    url: `${reference}/${id}/${type}`,
    params
  })
}

const useUsersQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyUsers[1] & {
  options?: UseInfiniteQueryOptions<
    InstanceResponse<Mastodon.Account[]>,
    AxiosError
  >
}) => {
  const queryKey: QueryKeyUsers = ['Users', { ...queryKeyParams }]
  return useInfiniteQuery(queryKey, queryFunction, options)
}

export { useUsersQuery }
