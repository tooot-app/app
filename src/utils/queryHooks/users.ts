import apiInstance from '@api/instance'
import { TabSharedStackParamList } from '@utils/navigation/navigators'
import { AxiosError } from 'axios'
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query'

export type QueryKeyUsers = [
  'Users',
  TabSharedStackParamList['Tab-Shared-Users']
]

const queryFunction = ({
  queryKey,
  pageParam
}: {
  queryKey: QueryKeyUsers
  pageParam?: { [key: string]: string }
}) => {
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
    {
      body: Mastodon.Account[]
      links?: { prev?: string; next?: string }
    },
    AxiosError,
    {
      body: Mastodon.Account[]
      links?: { prev?: string; next?: string }
    }
  >
}) => {
  const queryKey: QueryKeyUsers = ['Users', { ...queryKeyParams }]
  return useInfiniteQuery(queryKey, queryFunction, options)
}

export { useUsersQuery }
