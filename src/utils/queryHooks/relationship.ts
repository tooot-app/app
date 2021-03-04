import apiInstance from '@api/instance'
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

  return apiInstance<Mastodon.Relationship[]>({
    method: 'get',
    url: `accounts/relationships`,
    params: {
      'id[]': id
    }
  }).then(res => res.body)
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
      return apiInstance<Mastodon.Relationship>({
        method: 'post',
        url: `follow_requests/${params.id}/${params.payload.action}`
      }).then(res => res.body)
    case 'outgoing':
      return apiInstance<Mastodon.Relationship>({
        method: 'post',
        url: `accounts/${params.id}/${params.payload.state ? 'un' : ''}${
          params.payload.action
        }`
      }).then(res => res.body)
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
