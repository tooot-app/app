import {
  QueryFunctionContext,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from '@tanstack/react-query'
import apiInstance from '@utils/api/instance'
import { AxiosError } from 'axios'

export type QueryKeyRelationship = ['Relationship', { id?: Mastodon.Account['id'] }]

const queryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyRelationship>) => {
  const { id } = queryKey[1]
  if (!id) return Promise.reject()

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
    enabled:
      (typeof options?.enabled === 'boolean' ? options.enabled : true) && !!queryKeyParams.id,
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
        reblogs?: undefined
        notify?: undefined
      }
    }
  | {
      id: Mastodon.Account['id']
      type: 'outgoing'
      payload: {
        action: 'follow'
        state: boolean
        reblogs?: boolean
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
      const body: { reblogs?: boolean; notify?: boolean } = {}
      typeof params.payload.reblogs === 'boolean' && (body.reblogs = params.payload.reblogs)
      typeof params.payload.notify === 'boolean' && (body.notify = params.payload.notify)

      return apiInstance<Mastodon.Relationship>({
        method: 'post',
        url: `accounts/${params.id}/${params.payload.state ? 'un' : ''}${params.payload.action}`,
        body
      }).then(res => res.body)
  }
}

const useRelationshipMutation = (
  options: UseMutationOptions<Mastodon.Relationship, AxiosError, MutationVarsRelationship>
) => {
  return useMutation(mutationFunction, options)
}

export { useRelationshipQuery, useRelationshipMutation }
