import {
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from '@tanstack/react-query'
import { PagedResponse } from '@utils/api/helpers'
import apiInstance from '@utils/api/instance'
import { featureCheck } from '@utils/helpers/featureCheck'
import { setAccountStorage } from '@utils/storage/actions'
import { AxiosError } from 'axios'
import { infinitePageParams } from './utils'

export type QueryKeyFollowedTags = ['FollowedTags']
const useFollowedTagsQuery = (
  params: {
    options?: Omit<
      UseInfiniteQueryOptions<PagedResponse<Mastodon.Tag[]>, AxiosError>,
      'getPreviousPageParam' | 'getNextPageParam'
    >
  } | void
) => {
  const canFollowTags = featureCheck('follow_tags')

  const queryKey: QueryKeyFollowedTags = ['FollowedTags']
  return useInfiniteQuery(
    queryKey,
    async ({ pageParam }: QueryFunctionContext<QueryKeyFollowedTags>) => {
      const params: { [key: string]: string } = { ...pageParam }
      return await apiInstance<Mastodon.Tag[]>({
        method: 'get',
        url: `followed_tags`,
        params: { limit: 200, ...params }
      })
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      ...params?.options,
      ...infinitePageParams,
      enabled: canFollowTags && params?.options?.enabled,
      onSuccess: data => {
        setAccountStorage([
          {
            key: 'followed_tags',
            value: data.pages[0].body.map(tag => ({
              name: tag.name.toLowerCase(),
              following: tag.following
            }))
          }
        ])
        if (params?.options?.onSuccess) {
          params.options.onSuccess(data)
        }
      }
    }
  )
}

export type QueryKeyTag = ['Tag', { tag_name: string }]
const queryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyTag>) => {
  const { tag_name } = queryKey[1]

  const res = await apiInstance<Mastodon.Tag>({ method: 'get', url: `tags/${tag_name}` })
  return res.body
}
const useTagQuery = ({
  tag_name,
  options
}: {
  tag_name: Mastodon.Tag['name']
  options?: UseQueryOptions<Mastodon.Tag, AxiosError>
}) => {
  const queryKey: QueryKeyTag = ['Tag', { tag_name }]
  return useQuery(queryKey, queryFunction, options)
}

type MutationVarsTag = { tag_name: Mastodon.Tag['name']; to: boolean }
const mutationFunction = async ({ tag_name, to }: MutationVarsTag) => {
  return apiInstance<{}>({
    method: 'post',
    url: `tags/${tag_name}/${to ? 'follow' : 'unfollow'}`
  })
}
const useTagMutation = (options: UseMutationOptions<{}, AxiosError, MutationVarsTag>) => {
  return useMutation(mutationFunction, options)
}

export { useFollowedTagsQuery, useTagQuery, useTagMutation }
