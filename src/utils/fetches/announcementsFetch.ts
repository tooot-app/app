import client from '@api/client'

export const announcementFetch = async ({
  queryKey
}: {
  queryKey: QueryKey.Announcements
}): Promise<Mastodon.Announcement[]> => {
  const [_, { showAll }] = queryKey

  const res = await client({
    method: 'get',
    instance: 'local',
    url: `announcements`,
    ...(showAll && {
      params: {
        with_dismissed: 'true'
      }
    })
  })
  return Promise.resolve(res.body)
}
