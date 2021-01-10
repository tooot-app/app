import client from '@api/client'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKeyRelationship = [
  'Relationship',
  { id: Mastodon.Account['id'] }
]

const queryFunction = ({ queryKey }: { queryKey: QueryKeyRelationship }) => {
  const { id } = queryKey[1]

  return client<Mastodon.Relationship[]>({
    method: 'get',
    instance: 'local',
    url: `accounts/relationships`,
    params: {
      'id[]': id
    }
  })
}

const hookRelationship = ({
  options,
  ...queryKeyParams
}: QueryKeyRelationship[1] & {
  options?: UseQueryOptions<
    Mastodon.Relationship[],
    AxiosError,
    Mastodon.Relationship
  >
}) => {
  const queryKey: QueryKeyRelationship = ['Relationship', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, {
    ...options,
    select: data => data[0]
  })
}

export default hookRelationship
