import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import {
  QueryFunctionContext,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from 'react-query'

type QueryKeyFollowedTags = ['FollowedTags']
const useFollowedTagsQuery = ({
  options
}: {
  options?: UseQueryOptions<Mastodon.Tag, AxiosError>
}) => {
  const queryKey: QueryKeyFollowedTags = ['FollowedTags']
  return useQuery(
    queryKey,
    async ({ pageParam }: QueryFunctionContext<QueryKeyFollowedTags>) => {
      const params: { [key: string]: string } = { ...pageParam }
      const res = await apiInstance<Mastodon.Tag>({ method: 'get', url: `followed_tags`, params })
      return res.body
    },
    options
  )
}

type QueryKeyTags = ['Tags', { tag: string }]
const queryFunction = ({ queryKey }: QueryFunctionContext<QueryKeyTags>) => {
  const { tag } = queryKey[1]

  return apiInstance<Mastodon.Tag>({ method: 'get', url: `tags/${tag}` }).then(res => res.body)
}
const useTagsQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyTags[1] & {
  options?: UseQueryOptions<Mastodon.Tag, AxiosError>
}) => {
  const queryKey: QueryKeyTags = ['Tags', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

type MutationVarsAnnouncement = { tag: string; type: 'follow'; to: boolean }
const mutationFunction = async ({ tag, type, to }: MutationVarsAnnouncement) => {
  switch (type) {
    case 'follow':
      return apiInstance<{}>({
        method: 'post',
        url: `tags/${tag}/${to ? 'follow' : 'unfollow'}`
      })
  }
}
const useTagsMutation = (options: UseMutationOptions<{}, AxiosError, MutationVarsAnnouncement>) => {
  return useMutation(mutationFunction, options)
}

export { useFollowedTagsQuery, useTagsQuery, useTagsMutation }
