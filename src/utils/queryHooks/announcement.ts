import client from '@api/client'
import { AxiosError } from 'axios'
import { useQuery, UseQueryOptions } from 'react-query'

type QueryKey = ['Announcements', { showAll?: boolean }]

const queryFunction = ({ queryKey }: { queryKey: QueryKey }) => {
  const { showAll } = queryKey[1]

  return client<Mastodon.Announcement[]>({
    method: 'get',
    instance: 'local',
    url: `announcements`,
    ...(showAll && {
      params: {
        with_dismissed: 'true'
      }
    })
  })
}

const hookAnnouncement = <TData = Mastodon.Announcement[]>({
  options,
  ...queryKeyParams
}: QueryKey[1] & {
  options?: UseQueryOptions<Mastodon.Announcement[], AxiosError, TData>
}) => {
  const queryKey: QueryKey = ['Announcements', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export default hookAnnouncement
