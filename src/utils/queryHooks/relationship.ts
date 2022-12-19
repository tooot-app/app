import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import {
  QueryFunctionContext,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from '@tanstack/react-query'

export type QueryKeyRelationship = ['Relationship', { id: Mastodon.Account['id'] }]

const queryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyRelationship>) => {
  const { id } = queryKey[1]

  const res = await apiInstance<Mastodon.Relationship[]>({
    method: 'get',
    url: `accounts/relationships`,
    params: {
      'id[]': id
    }
  })
  return res.body
}

const useRelationshipQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyRelationship[1] & {
  options?: UseQueryOptions<Mastodon.Relationship[], AxiosError, Mastodon.Relationship>
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
      payload: {
        action: 'block'
        state: boolean
        notify?: undefined
      }
    }
  | {
      id: Mastodon.Account['id']
      type: 'outgoing'
      payload: {
        action: 'follow'
        state: boolean
        notify?: boolean
      }
    }

const mutationFunction = async (params: MutationVarsRelationship) => {
  switch (params.type) {
    case 'incoming':
      return apiInstance<Mastodon.Relationship>({
        method: 'post',
        url: `follow_requests/${params.id}/${params.payload.action}`
      }).then(res => res.body)
    case 'outgoing':
      const formData = new FormData()
      typeof params.payload.notify === 'boolean' &&
        formData.append('notify', params.payload.notify.toString())

      return apiInstance<Mastodon.Relationship>({
        method: 'post',
        url: `accounts/${params.id}/${params.payload.state ? 'un' : ''}${params.payload.action}`,
        body: formData
      }).then(res => res.body)
  }
}

const useRelationshipMutation = (
  options: UseMutationOptions<Mastodon.Relationship, AxiosError, MutationVarsRelationship>
) => {
  return useMutation(mutationFunction, options)
}

export { useRelationshipQuery, useRelationshipMutation }
