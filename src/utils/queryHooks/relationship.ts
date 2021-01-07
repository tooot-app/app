import client from '@api/client'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKey = ['Relationship', { id: Mastodon.Account['id'] }]

const queryFunction = ({ queryKey }: { queryKey: QueryKey }) => {
  const { id } = queryKey[1]

  return client<Mastodon.Relationship>({
    method: 'get',
    instance: 'local',
    url: `accounts/relationships`,
    params: {
      'id[]': id
    }
  })
}

const hookRelationship = <TData = Mastodon.Relationship>({
  options,
  ...queryKeyParams
}: QueryKey[1] & {
  options?: UseQueryOptions<Mastodon.Relationship, AxiosError, TData>
}) => {
  const queryKey: QueryKey = ['Relationship', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export default hookRelationship
