import client from '@api/client'

export const announcementFetch = async (): Promise<Mastodon.Announcement[]> => {
  const res = await client({
    method: 'get',
    instance: 'local',
    url: `announcements`
  })
  return Promise.resolve(res.body)
}
