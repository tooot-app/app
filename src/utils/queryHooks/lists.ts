import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from 'react-query'

export type QueryKeyLists = ['Lists']

const queryFunction = async () => {
  const res = await apiInstance<Mastodon.List[]>({
    method: 'get',
    url: 'lists'
  })
  return res.body
}

const useListsQuery = ({ options }: { options?: UseQueryOptions<Mastodon.List[], AxiosError> }) => {
  const queryKey: QueryKeyLists = ['Lists']
  return useQuery(queryKey, queryFunction, options)
}

type MutationVarsLists =
  | {
      type: 'add'
      payload: Omit<Mastodon.List, 'id'>
    }
  | {
      type: 'edit'
      payload: Mastodon.List
    }
  | {
      type: 'delete'
      payload: Pick<Mastodon.List, 'id'>
    }

const mutationFunction = async (params: MutationVarsLists) => {
  const body = new FormData()
  switch (params.type) {
    case 'add':
      body.append('title', params.payload.title)
      body.append('replies_policy', params.payload.replies_policy)

      return apiInstance<Mastodon.List>({
        method: 'post',
        url: 'lists',
        body
      }).then(res => res.body)
    case 'edit':
      body.append('title', params.payload.title)
      body.append('replies_policy', params.payload.replies_policy)

      return apiInstance<Mastodon.List>({
        method: 'put',
        url: `lists/${params.payload.id}`,
        body
      }).then(res => res.body)
    case 'delete':
      return apiInstance({
        method: 'delete',
        url: `lists/${params.payload.id}`
      })
  }
}

const useListsMutation = (
  options: UseMutationOptions<Mastodon.List, AxiosError, MutationVarsLists>
) => {
  return useMutation(mutationFunction, options)
}

export { useListsQuery, useListsMutation }
