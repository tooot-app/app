import apiInstance from '@api/instance'
import { AxiosError } from 'axios'
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from 'react-query'

type QueryKeyAnnouncement = ['Announcements', { showAll?: boolean }]

const queryFunction = ({ queryKey }: { queryKey: QueryKeyAnnouncement }) => {
  const { showAll } = queryKey[1]

  return apiInstance<Mastodon.Announcement[]>({
    method: 'get',
    url: `announcements`,
    ...(showAll && {
      params: {
        with_dismissed: 'true'
      }
    })
  }).then(res => res.body)
}

const useAnnouncementQuery = <TData = Mastodon.Announcement[]>({
  options,
  ...queryKeyParams
}: QueryKeyAnnouncement[1] & {
  options?: UseQueryOptions<Mastodon.Announcement[], AxiosError, TData>
}) => {
  const queryKey: QueryKeyAnnouncement = [
    'Announcements',
    { ...queryKeyParams }
  ]
  return useQuery(queryKey, queryFunction, options)
}

type MutationVarsAnnouncement = {
  id: Mastodon.Announcement['id']
  type: 'reaction' | 'dismiss'
  name?: Mastodon.AnnouncementReaction['name']
  me?: boolean
}

const mutationFunction = async ({
  id,
  type,
  name,
  me
}: MutationVarsAnnouncement) => {
  switch (type) {
    case 'reaction':
      return apiInstance<{}>({
        method: me ? 'delete' : 'put',
        url: `announcements/${id}/reactions/${name}`
      })
    case 'dismiss':
      return apiInstance<{}>({
        method: 'post',
        url: `announcements/${id}/dismiss`
      })
  }
}

const useAnnouncementMutation = (
  options: UseMutationOptions<{}, AxiosError, MutationVarsAnnouncement>
) => {
  return useMutation(mutationFunction, options)
}

export { useAnnouncementQuery, useAnnouncementMutation }
