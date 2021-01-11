import client from '@api/client'
import { AxiosError } from 'axios'
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from 'react-query'

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

const useRelationshipQuery = ({
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

type MutationVarsRelationship =
  | {
      id: Mastodon.Account['id']
      type: 'incoming'
      payload: { action: 'authorize' | 'reject' }
    }
  | {
      id: Mastodon.Account['id']
      type: 'outgoing'
      payload: { action: 'follow' | 'block'; state: boolean }
    }

const mutationFunction = async (params: MutationVarsRelationship) => {
  switch (params.type) {
    case 'incoming':
      return client<Mastodon.Relationship>({
        method: 'post',
        instance: 'local',
        url: `follow_requests/${params.id}/${params.payload.action}`
      })
    case 'outgoing':
      return client<Mastodon.Relationship>({
        method: 'post',
        instance: 'local',
        url: `accounts/${params.id}/${params.payload.state ? 'un' : ''}${
          params.payload.action
        }`
      })
  }
}

const useRelationshipMutation = (
  options: UseMutationOptions<
    Mastodon.Relationship,
    AxiosError,
    MutationVarsRelationship
  >
) => {
  return useMutation(mutationFunction, options)
}

export { useRelationshipQuery, useRelationshipMutation }
