import client from '@api/client'

export const searchFetch = async (
  {} = {},
  {
    type,
    term,
    limit = 20
  }: {
    type?: 'accounts' | 'hashtags' | 'statuses'
    term: string
    limit?: number
  }
): Promise<
  | Mastodon.Account[]
  | Mastodon.Tag[]
  | Mastodon.Status[]
  | {
      accounts: Mastodon.Account[]
      hashtags: Mastodon.Tag[]
      statuses: Mastodon.Status[]
    }
> => {
  const res = await client({
    version: 'v2',
    method: 'get',
    instance: 'local',
    url: 'search',
    params: { ...(type && { type }), q: term, limit }
  })
  if (type) {
    return Promise.resolve(res.body[type])
  } else {
    return Promise.resolve(res.body)
  }
}
