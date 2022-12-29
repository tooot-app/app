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
      enabled: canFollowTags,
      staleTime: Infinity,
      cacheTime: Infinity,
      ...params?.options,
      ...infinitePageParams,
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

export type QueryKeyTags = ['Tags', { tag: string }]
const queryFunction = async ({ queryKey }: QueryFunctionContext<QueryKeyTags>) => {
  const { tag } = queryKey[1]

  const res = await apiInstance<Mastodon.Tag>({ method: 'get', url: `tags/${tag}` })
  return res.body
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

type MutationVarsAnnouncement = { tag: string; to: boolean }
const mutationFunction = async ({ tag, to }: MutationVarsAnnouncement) => {
  return apiInstance<{}>({
    method: 'post',
    url: `tags/${tag}/${to ? 'follow' : 'unfollow'}`
  })
}
const useTagsMutation = (options: UseMutationOptions<{}, AxiosError, MutationVarsAnnouncement>) => {
  return useMutation(mutationFunction, options)
}

export { useFollowedTagsQuery, useTagsQuery, useTagsMutation }
